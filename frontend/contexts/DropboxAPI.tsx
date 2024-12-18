import React, {
	createContext,
	FC,
	PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import DropboxAPI from "../services/DropboxAPI";
import { useConfig } from "./Config";

const DROPBOX_AUTH_TABLE_ID = "tblLsaz5SX620eWOo";

interface ContextValue {
	loading: boolean;
	error: string;
	dropboxAPI: DropboxAPI | null;
}

const DropboxAPIContext = createContext<ContextValue>();

export const DropboxAPIProvider: FC<PropsWithChildren> = ({ children }) => {
	const { appId } = useConfig();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [dropboxAPI, setDropboxAPI] = useState<DropboxAPI | null>(null);

	useEffect(() => {
		if (!appId) {
			setDropboxAPI(null);
			return;
		}

		async function initDropboxAPI() {
			setLoading(true);
			setError(false);

			try {
				const dropboxAPI = await DropboxAPI.fromRecord(
					DROPBOX_AUTH_TABLE_ID,
					appId
				);

				setDropboxAPI(dropboxAPI);
			} catch (error) {
				console.error(error);
				setError(true);
			}

			setLoading(false);
		}

		initDropboxAPI();
	}, [appId]);

	const contextValue = useMemo(
		(): ContextValue => ({ loading, error, dropboxAPI }),
		[dropboxAPI, error, loading]
	);

	return (
		<DropboxAPIContext.Provider value={contextValue}>
			{children}
		</DropboxAPIContext.Provider>
	);
};

export const useDropboxAPI = () => {
	const context = useContext(DropboxAPIContext);

	if (!context) {
		throw new Error("useDropboxAPI must be used within an DropboxAPIProvider");
	}

	return context;
};
