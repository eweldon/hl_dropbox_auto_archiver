import wait from "./wait";

type ProcessCallback<T> = (
	item: T,
	index: number,
	stop: () => void
) => void | Promise<void>;

function batchProcess<T>(
	items: T[],
	callback: ProcessCallback<T>,
	maxConcurrentProcesses: number,
	interval?: number
): Promise<void> {
	const iter = items.entries();
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

			const { value: entry, done } = iter.next() as {
				value: [number, T] | null;
				done: boolean;
			};

			if (done) {
				finished = true;
			} else if (entry) {
				const runTask = async () => {
					if (interval && interval > 0) {
						nextRun = Math.max(nextRun, Date.now());
						const timeout = nextRun - Date.now();
						nextRun += interval;

						await wait(timeout);
					}

					try {
						const [index, value] = entry;
						await callback(value, index, stop);
					} catch (error) {
						console.error(error);
					}

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
