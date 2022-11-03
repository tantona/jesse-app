import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { create } from "twrnc";
import { useImmerReducer } from "use-immer";
import * as Contacts from "expo-contacts";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";
import { v4 } from "uuid";

interface IState {
  receipts: TReceipt[];
  priceSheets: Record<string, TPriceSheet[]>;
}

export type TSignature = {
  signature: string;
  date: string;
};

const ctx = createContext<{ state: IState; dispatch: React.Dispatch<TDispatcherAction> }>({
  state: { receipts: [], priceSheets: {} },
  dispatch: () => {},
});

type TAddRecieipt = {
  type: "add-receipt";
  data: any;
};

type TAddPriceSheet = {
  type: "create-priceSheet";
  data: TPriceSheet;
};

type TCreateReceipt = {
  type: "create-receipt";
  data: TReceipt;
};

export type TPartData = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

type TDataLoaded = {
  type: "data-loaded";
  data: {
    receipts: TReceipt[];
    priceSheets: Record<string, TPriceSheet[]>;
  };
};

export type TPriceSheet = {
  id: string;
  category: string;
  created: string;
  items: TPartData[];
  fileName: string;
};

type TClearData = {
  type: "clear-data";
};

type TSaveSignature = {
  type: "save-signature";
  data: {
    receiptId: string;
    signature: TSignature;
  };
};

type TRemovePriceSheet = {
  type: "remove-pricesheet";
  data: {
    category: string;
    index: number;
  };
};

type TCreatePriceSheetCategory = {
  type: "create-pricesheet-category";
  data: {
    category: string;
  };
};

type TDispatcherAction =
  | TAddRecieipt
  | TAddPriceSheet
  | TDataLoaded
  | TCreateReceipt
  | TSaveSignature
  | TClearData
  | TRemovePriceSheet
  | TCreatePriceSheetCategory;

export type TReceipt = {
  id: string;
  receiptNo: string;
  created: string;
  customer?: Contacts.Contact;
  parts?: TPartData[];
  signature?: TSignature;
};

const INITIAL_STATE: IState = {
  receipts: [],
  priceSheets: {},
};

export const KEY_FORMAT = "yyyy-dd-MM";
export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const { setItem, getItem } = useAsyncStorage("@data");
  const [state, dispatch] = useImmerReducer<IState, TDispatcherAction>((state, action) => {
    switch (action.type) {
      case "create-pricesheet-category":
        state.priceSheets[action.data.category] = [];
        return state;
      case "create-priceSheet":
        state.priceSheets[action.data.category].unshift(action.data);
        return state;

      case "remove-pricesheet":
        state.priceSheets[action.data.category] = state.priceSheets[action.data.category].filter(
          (_, index) => index !== action.data.index
        );
        return state;

      case "data-loaded":
        state.priceSheets = action.data.priceSheets;
        state.receipts = action.data.receipts;
        return state;

      case "create-receipt":
        state.receipts.push(action.data);
        return state;

      case "save-signature":
        state.receipts.find((s) => s.id === action.data.receiptId).signature = action.data.signature;
        return state;

      case "clear-data":
        state = INITIAL_STATE;
        return state;
      default:
        return state;
    }
  }, INITIAL_STATE);

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

  const createPriceSheet = (data: TPriceSheet) => {
    dispatch({
      type: "create-priceSheet",
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

  const saveSignature = (receiptId: string, signature: TSignature) => {
    dispatch({
      type: "save-signature",
      data: {
        receiptId,
        signature,
      },
    });
  };

  const clear = () => {
    removeItem();
    dispatch({ type: "clear-data" });
  };

  const removePricesheet = (category: string, index: number) => {
    dispatch({ type: "remove-pricesheet", data: { category, index } });
  };

  const createPriceSheetCategory = (category: string) => {
    dispatch({ type: "create-pricesheet-category", data: { category } });
  };

  const categories = useMemo(() => {
    return Object.keys(state.priceSheets);
  }, [state.priceSheets]);

  return {
    ...state,
    categories,
    createPriceSheetCategory,
    createPriceSheet,
    removePricesheet,
    createReceipt,
    saveSignature,
    clear,
  };
};
