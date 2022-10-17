import { createContext, FC, PropsWithChildren, useContext, useEffect } from "react";
import { create } from "twrnc";
import { useImmerReducer } from "use-immer";
import * as Contacts from "expo-contacts";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";
import { v4 } from "uuid";

interface IState {
  receipts: TReceipt[];
  datasets: TDatasets;
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
  price: string;
};

type TDataLoaded = {
  type: "data-loaded";
  data: TDatasets;
};

export type TDataset = {
  id: string;
  created: string;
  items: TPartData[];
};

export type TDatasets = TDataset[];

type TDispatcherAction = TAddRecieipt | TAddDataset | TDataLoaded | TCreateReceipt;

export type TReceipt = {
  id: string;
  receiptNo: string;
  created: Date;
  customer?: Contacts.Contact;
  parts?: TPartData[];
};

const receipts: TReceipt[] = [
  {
    id: "1",
    receiptNo: "0001",
    created: new Date("2022-10-13"),
    customer: {
      lastName: "Appleseed",
      contactType: "person",
      imageAvailable: false,
      id: "410FE041-5C4E-48DA-B4DE-04C15EA3DBAC",
      emails: [{ email: "John-Appleseed@mac.com", label: "work", id: "172726CF-4C0A-44C3-B9D8-0C86F7E654AD" }],
      addresses: [
        {
          region: "GA",
          street: "3494 Kuhl Avenue",
          id: "2EAD19A1-01AC-4A46-A27E-A9831C9B3245",
          city: "Atlanta",
          country: "USA",
          postalCode: "30303",
          label: "work",
          isoCountryCode: "us",
        },
        {
          region: "GA",
          street: "1234 Laurel Street",
          id: "4F2BAAD4-98DE-459B-99CE-A2BF15408396",
          city: "Atlanta",
          country: "USA",
          postalCode: "30303",
          label: "home",
          isoCountryCode: "us",
        },
      ],
      name: "John Appleseed",
      phoneNumbers: [
        {
          countryCode: "us",
          id: "E297F1F7-CAFC-4A9D-ABF8-F79DB4496C87",
          number: "888-555-5512",
          digits: "8885555512",
          label: "mobile",
        },
        {
          countryCode: "us",
          id: "5E423897-5B64-4129-AF55-10B1B3153697",
          number: "888-555-1212",
          digits: "8885551212",
          label: "home",
        },
      ],
      firstName: "John",
    },
    parts: [],
  },
  {
    id: "2",
    receiptNo: "0002",
    created: new Date("2022-10-15"),
    customer: null,
    parts: [],
  },
  {
    id: "3",
    receiptNo: "0003",
    created: new Date("2022-10-17"),
    customer: null,
    parts: [],
  },
];

export const KEY_FORMAT = "yyyy-dd-MM";
export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const { getItem } = useAsyncStorage("@datasets");
  const [state, dispatch] = useImmerReducer<IState, TDispatcherAction>(
    (state, action) => {
      switch (action.type) {
        case "add-dataset":
          const key = DateTime.fromJSDate(new Date()).toFormat(KEY_FORMAT);
          state.datasets[key] = action.data;
          return state;
        case "data-loaded":
          state.datasets = action.data;
          return state;

        case "create-receipt":
          state.receipts.push(action.data);
          return state;
        default:
          return state;
      }
    },
    {
      receipts,
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

  return <ctx.Provider value={{ state, dispatch }}>{children}</ctx.Provider>;
};

export const useAppState = () => {
  const { setItem, getItem } = useAsyncStorage("@datasets");
  const { state, dispatch } = useContext(ctx);

  const addDataset = async (data: TDataset) => {
    await setItem(
      JSON.stringify([
        ...state.datasets,
        {
          id: v4(),
          created: DateTime.now().toString(),
          items: data,
        },
      ])
    );
    const datasets = await getItem();
    dispatch({ type: "data-loaded", data: JSON.parse(datasets) });
  };

  const createReceipt = (data: { receiptNo: string; customer: Contacts.Contact; parts: TPartData[] }) => {
    dispatch({
      type: "create-receipt",
      data: {
        id: v4(),
        created: new Date(),
        ...data,
      },
    });
  };
  return {
    ...state,
    addDataset,
    createReceipt,
  };
};
