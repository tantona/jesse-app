import { createContext, FC, PropsWithChildren, useContext, useEffect } from "react";
import { create } from "twrnc";
import { useImmerReducer } from "use-immer";
import * as Contacts from "expo-contacts";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";
import { v4 } from "uuid";

interface IState {
  receipts: TReceipt[];
  datasets: TDataset[];
}

const ctx = createContext<{ state: IState; dispatch: React.Dispatch<TDispatcherAction> }>({
  state: { receipts: [], datasets: [] },
  dispatch: () => {},
});

type TAddRecieipt = {
  type: "add-receipt";
  data: any;
};

type TAddDataset = {
  type: "add-dataset";
  data: TDataset;
};

type TCreateReceipt = {
  type: "create-receipt";
  data: TReceipt;
};

export type TPartData = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type TDataLoaded = {
  type: "data-loaded";
  data: {
    receipts: TReceipt[];
    datasets: TDataset[];
  };
};

export type TDataset = {
  id: string;
  created: string;
  items: TPartData[];
};

type TDispatcherAction = TAddRecieipt | TAddDataset | TDataLoaded | TCreateReceipt;

export type TReceipt = {
  id: string;
  receiptNo: string;
  created: string;
  customer?: Contacts.Contact;
  parts?: TPartData[];
};

export const KEY_FORMAT = "yyyy-dd-MM";
export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const { setItem, getItem } = useAsyncStorage("@data");
  const [state, dispatch] = useImmerReducer<IState, TDispatcherAction>(
    (state, action) => {
      switch (action.type) {
        case "add-dataset":
          state.datasets.push(action.data);
          return state;

        case "data-loaded":
          state.datasets = action.data.datasets;
          state.receipts = action.data.receipts;
          return state;

        case "create-receipt":
          state.receipts.push(action.data);
          return state;
        default:
          return state;
      }
    },
    {
      receipts: [],
      datasets: [],
    }
  );

  useEffect(() => {
    getItem().then((result) => {
      if (!result) {
        return;
      }

      dispatch({ type: "data-loaded", data: JSON.parse(result) });
    });
  }, []);

  useEffect(() => {
    setItem(JSON.stringify(state))
      .then((resp) => console.log(resp, "saved", state))
      .catch(console.log);
  }, [state]);

  return <ctx.Provider value={{ state, dispatch }}>{children}</ctx.Provider>;
};

export const useAppState = () => {
  const { state, dispatch } = useContext(ctx);
  const { removeItem } = useAsyncStorage("@data");

  const addDataset = (data: TDataset) => {
    dispatch({
      type: "add-dataset",
      data,
    });
  };

  const createReceipt = (data: { receiptNo: string; customer: Contacts.Contact; parts: TPartData[] }) => {
    dispatch({
      type: "create-receipt",
      data: {
        id: v4(),
        created: DateTime.now().toString(),
        ...data,
      },
    });
  };
  return {
    ...state,
    addDataset,
    createReceipt,
    clear: removeItem,
  };
};
