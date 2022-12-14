import { TReceipt } from "./hooks/appState";

export type IPriceSheetCategory = {
  category: string;
};

export type RootStackParamList = {
  Intro: {};
  PriceSheets: {};
  PriceSheetCategory: IPriceSheetCategory;
  Receipts: {};
  // Receipt: TReceipt;
};
