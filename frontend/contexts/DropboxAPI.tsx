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
import Loading from "../components/Loading";
import { Label } from "@airtable/blocks/ui";

const DROPBOX_AUTH_TABLE_ID = "tblLsaz5SX620eWOo";

const DropboxAPIContext = createContext<{ dropboxAPI: DropboxAPI | null }>({
	dropboxAPI: null,
});

interface Props extends PropsWithChildren {
	appId: string | null;
}

export const DropboxAPIProvider: FC<Props> = ({ appId, children }) => {
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

	const wrappedDropboxAPI = useMemo(() => ({ dropboxAPI }), [dropboxAPI]);

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return <Label>{`Could not retrieve app's token`}</Label>;
	}

	return (
		<DropboxAPIContext.Provider value={wrappedDropboxAPI}>
			{children}
		</DropboxAPIContext.Provider>
	);
};

export const useDropboxAPI = () => {
	const context = useContext(DropboxAPIContext);

	if (!context) {
		throw new Error("useDropboxAPI must be used within an DropboxAPIProvider");
	}

	return context.dropboxAPI;
};
