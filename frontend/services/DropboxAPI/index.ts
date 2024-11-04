import { base } from "@airtable/blocks";
import fieldIds from "../../constants/field-ids";
import wait from "../../utils/wait";
import {
	BatchTransferCheckResponse,
	BatchTransferResponse,
	EntriesResponse,
	FilesResponse,
} from "./responses";
import {
	BatchCopyParams,
	BatchMoveParams,
	BatchTransferCheckParams,
	ListFolderParams,
} from "./parameters";
import { join } from "../../utils/join";
import { Entry } from "../../types/Entry";

const GRANT_TYPE = "refresh_token";

class DropboxAPI {
	static Endpoints = {
		tokenRefresh: `https://api.dropboxapi.com/oauth2/token`,
		search: `https://api.dropboxapi.com/2/files/search_v2`,
		searchContinue: `https://api.dropboxapi.com/2/files/search/continue_v2`,
		listFolder: `https://api.dropboxapi.com/2/files/list_folder`,
		listFolderContinue: `https://api.dropboxapi.com/2/files/list_folder/continue`,
		moveBatch: `https://api.dropboxapi.com/2/files/move_batch_v2`,
		moveBatchCheck: `https://api.dropboxapi.com/2/files/move_batch/check_v2`,
		copyBatch: `https://api.dropboxapi.com/2/files/copy_batch_v2`,
		copyBatchCheck: `https://api.dropboxapi.com/2/files/copy_batch/check_v2`,
		getMetadata: `https://api.dropboxapi.com/2/files/get_metadata`,
	} as const;

	static async fromRecord(authTableId: string, recordId: string) {
		const table = base.getTable(authTableId);
		const record = await table
			.selectRecordsAsync()
			.then((query) => query.getRecordById(recordId));

		if (!record) {
			throw new Error("Auth row not found");
		}

		const {
			appKey,
			appSecret,
			refreshToken,
			accessToken,
			expirationTimestamp,
		} = Object.fromEntries(
			Object.entries(fieldIds).map(([field, id]) => [
				field,
				record.getCellValue(id),
			])
		);

		const dropboxAPI = new DropboxAPI(
			appKey,
			appSecret,
			refreshToken,
			accessToken,
			expirationTimestamp
		);

		if (!dropboxAPI.isAccessTokenValid) {
			const { accessToken, expirationTimestamp } =
				await dropboxAPI.refreshAccessToken();

			await table.updateRecordAsync(recordId, {
				[fieldIds.accessToken]: accessToken,
				[fieldIds.expirationTimestamp]: expirationTimestamp,
			});
		}

		return dropboxAPI;
	}

	constructor(
		private appKey: string,
		private appSecret: string,
		private refreshToken: string,
		private accessToken: string,
		private expirationTimestamp: number
	) {}

	get isAccessTokenValid() {
		return (
			this.accessToken?.trim() &&
			this.expirationTimestamp &&
			this.expirationTimestamp > Date.now()
		);
	}

	async getValidAccessToken() {
		if (!this.isAccessTokenValid) {
			await this.refreshAccessToken();
		}

		return this.accessToken;
	}

	async refreshAccessToken() {
		const params = new URLSearchParams({
			grant_type: GRANT_TYPE,
			refresh_token: this.refreshToken,
			client_id: this.appKey,
			client_secret: this.appSecret,
		});

		const response = await fetch(DropboxAPI.Endpoints.tokenRefresh, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params,
		});

		if (response.status === 200) {
			const { access_token: accessToken, expires_in } = await response.json();
			const expirationTimestamp = Date.now() + expires_in * 1000 - 60e3;

			this.accessToken = accessToken;
			this.expirationTimestamp = expirationTimestamp;

			return { accessToken, expirationTimestamp };
		}

		const error = await response.text();
		console.error(`${response.status} - ${response.statusText}`);
		console.error(error);

		throw new Error(error);
	}

	async searchFiles(
		path: string,
		query: string,
		foldersOnly?: boolean
	): Promise<FilesResponse | null> {
		const params = {
			match_field_options: {
				include_highlights: false,
			},
			options: {
				path,
				file_status: "active",
				filename_only: false,
				max_results: 1000,
				file_categories: foldersOnly ? ["folder"] : undefined,
			},
			query,
		};

		const response = await fetch(DropboxAPI.Endpoints.search, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as FilesResponse;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async continueSearch(
		cursor: string,
		retries: number = 0
	): Promise<FilesResponse | null> {
		const params = { cursor };

		const response = await fetch(DropboxAPI.Endpoints.searchContinue, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as FilesResponse;
		}

		if (retries > 0) {
			console.log(
				`[DropboxAPI] \`continueSearch\` failed with status: ${response.status}`
			);
			console.log(
				`[DropboxAPI] Retrying \`continueSearch\`... (${retries} times left)`
			);

			await wait(2e3);
			return this.continueSearch(cursor, retries - 1);
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async listFolderFiles({
		path,
		recursive,
		limit,
	}: ListFolderParams): Promise<EntriesResponse | null> {
		const params = { path: path, recursive, limit };

		const response = await fetch(DropboxAPI.Endpoints.listFolder, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as FilesResponse;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async continueListFolder(
		cursor: string,
		retries: number = 0
	): Promise<EntriesResponse | null> {
		const params = { cursor };

		const response = await fetch(DropboxAPI.Endpoints.listFolderContinue, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as FilesResponse;
		}

		if (retries > 0) {
			console.log(
				`[DropboxAPI] \`continueListFolder\` failed with status: ${response.status}`
			);
			console.log(
				`[DropboxAPI] Retrying \`continueListFolder\`... (${retries} times left)`
			);

			await wait(2e3);
			return this.continueListFolder(cursor, retries - 1);
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async batchCopy(
		entries: Entry[],
		destination: string,
		autoRename?: boolean = false
	) {
		const params: BatchCopyParams = {
			autorename: autoRename,
			entries: entries
				.map((entry) => {
					if (!entry.path) {
						return null;
					}

					return {
						from_path: entry.path,
						to_path: join(destination, entry.path),
					};
				})
				.filter(Boolean),
		};

		const response = await fetch(DropboxAPI.Endpoints.copyBatch, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as BatchTransferResponse;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async batchCopyCheck(asyncJobId: string) {
		const params: BatchTransferCheckParams = { async_job_id: asyncJobId };

		const response = await fetch(DropboxAPI.Endpoints.copyBatchCheck, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as BatchTransferCheckResponse;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async batchMove(
		entries: Entry[],
		destination: string,
		autoRename?: boolean = false,
		allowOwnershipTransfer?: boolean
	) {
		const params: BatchMoveParams = {
			allow_ownership_transfer: allowOwnershipTransfer,
			autorename: autoRename,
			entries: entries
				.map((entry) => {
					if (!entry.path) {
						return null;
					}

					return {
						from_path: entry.path,
						to_path: join(destination, entry.path),
					};
				})
				.filter(Boolean),
		};

		const response = await fetch(DropboxAPI.Endpoints.moveBatch, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as BatchTransferResponse;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async batchMoveCheck(asyncJobId: string) {
		const params: BatchTransferCheckParams = { async_job_id: asyncJobId };

		const response = await fetch(DropboxAPI.Endpoints.moveBatchCheck, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as BatchTransferCheckResponse;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}

	async getMetadata(file: string) {
		const params = { file };

		const response = await fetch(DropboxAPI.Endpoints.getMetadata, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${await this.getValidAccessToken()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (response.status === 200) {
			return (await response.json()) as EntryMetadata;
		}

		const errorMessage = await response.text();

		throw new Error(
			`[${response.status}: ${response.statusText}] ${errorMessage}`
		);
	}
}

export default DropboxAPI;
