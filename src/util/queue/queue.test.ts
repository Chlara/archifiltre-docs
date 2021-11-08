import { tap } from "rxjs/operators";
import { computeQueue } from "./queue";

describe("queue", () => {
    describe("computeQueue", () => {
        it("should handle a queue computation", async () => {
            const queue = ["result1", "result2", "error"];
            type Error = {
                type: "error"
            };
            type Result = {
                type: "result",
                value: string;
            }

            const error = (): Error => ({ type: "error" });
            const result = (value: string): Result => ({ type: "result", value });

            const valueComputer = (value: string): Promise<Result | Error> =>
                Promise.resolve(value === "error" ? error() : result(value));

            const isResult = (value: Error | Result): value is Result => value.type === "result";

            const queueComputer = computeQueue(valueComputer, isResult);

            const emitted: any[] = [];

            await queueComputer(queue)
                .pipe(tap(val => emitted.push(val)))
                .toPromise();

            expect(emitted).toEqual([
                {
                    remaining: [
                        "result2",
                        "error"
                    ],
                    errors: [],
                    results: [
                        result("result1"),
                    ]
                },
                {
                    remaining: [
                        "error"
                    ],
                    errors: [],
                    results: [
                        result("result1"),
                        result("result2")
                    ]
                },
                {
                    remaining: [],
                    errors: [
                        error()
                    ],
                    results: [
                        result("result1"),
                        result("result2")
                    ]
                }
            ]);
        })
    });
});