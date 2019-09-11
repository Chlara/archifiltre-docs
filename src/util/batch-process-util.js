import { makeEmptyArray } from "./array-util";
import { cpus } from "os";
import { Observable } from "rxjs";

// We create NB_CPUS - 1 processes to optimize computation
const NB_CPUS = cpus().length - 1;

const getNextBatch = (array, batchSize) => {
  return array.slice(0, batchSize);
};

const removeNextBatch = (array, batchSize) => {
  return array.slice(batchSize);
};

const initWorkers = (WorkerBuilder, { onMessage, initialValues }) =>
  makeEmptyArray(NB_CPUS, null)
    .map(() => new WorkerBuilder())
    .map(worker => {
      worker.postMessage({ type: "initialize", data: initialValues });
      worker.addEventListener("message", message => {
        onMessage(worker, message);
      });
      worker.addEventListener("error", error =>
        console.error("WorkerError", error)
      );
      return worker;
    });

export const computeBatch = (
  data,
  WorkerBuilder,
  { batchSize, initialValues }
) => {
  return new Observable(observer => {
    let remainingData = data;
    let runningWorkersCount = 0;

    const onMessage = (worker, { data: { type, result: data, error } }) => {
      switch (type) {
        case "result":
          observer.next(data);
          runningWorkersCount = runningWorkersCount - 1;
          if (remainingData.length !== 0) {
            processNext(worker);
          } else {
            if (runningWorkersCount === 0) {
              observer.complete();
            }
          }
          break;

        case "error":
          console.error(error);
          break;

        default:
          console.log(`Unhandled message : ${type}`);
      }
    };

    const processNext = worker => {
      const dataToProcess = getNextBatch(remainingData, batchSize);
      remainingData = removeNextBatch(remainingData, batchSize);
      runningWorkersCount = runningWorkersCount + 1;
      worker.postMessage({ type: "data", data: dataToProcess });
    };

    const workers = initWorkers(WorkerBuilder, { onMessage, initialValues });

    workers.map(worker => processNext(worker));
  });
};

export const aggregateResultsToMap = result => {
  return result.reduce((acc, { param, result }) => {
    return {
      ...acc,
      [param]: result
    };
  }, {});
};