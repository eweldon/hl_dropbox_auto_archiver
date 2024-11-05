import wait from "./wait";

type ProcessCallback<T> = (item: T, stop: () => void) => Promise<void>;

function batchProcess<T>(
	items: T[],
	callback: ProcessCallback<T>,
	maxConcurrentProcesses: number,
	interval?: number
): Promise<void> {
	const iter = items.values();
	let runningProcesses = 0;

	return new Promise((resolve) => {
		let finished = false;
		let nextRun = 0;

		const stop = () => {
			finished = true;
		};

		const onFinish = () => {
			startProcess();

			if (finished && runningProcesses === 0) {
				resolve();
			}
		};

		const startProcess = () => {
			if (finished) return false;
			if (runningProcesses >= maxConcurrentProcesses) return false;

			const { value, done } = iter.next() as {
				value: T | null;
				done: boolean;
			};

			if (done) {
				finished = true;
			} else if (value) {
				const runTask = async () => {
					if (interval && interval > 0) {
						nextRun = Math.max(nextRun, Date.now());
						const timeout = nextRun - Date.now();
						nextRun += interval;

						await wait(timeout);
					}

					await callback(value, stop).catch(console.error);
					--runningProcesses;
					onFinish();

					// console.log(`[batchProcess] -1 process (${runningProcesses})`);
				};

				++runningProcesses;
				runTask();

				// console.log(`[batchProcess] +1 process (${runningProcesses})`);
			}

			return true;
		};

		for (let i = 0; i < maxConcurrentProcesses; ++i) {
			startProcess();
		}

		onFinish();
	});
}

export default batchProcess;
