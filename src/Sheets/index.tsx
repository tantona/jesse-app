import { registerSheet } from "react-native-actions-sheet";
import { AddParts } from "./AddParts";
import { CreateReceipt } from "./CreateReceipt";
import { CreatePriceSheetCategory } from "./CreatePriceSheetCategory";
import { GetSignature } from "./GetSignature";
import { PickCustomer } from "./PickCustomer";
import { SelectCategory } from "./SelectCategory";

registerSheet("add-parts", AddParts, "create-receipt");
registerSheet("select-category", SelectCategory, "add-parts");
registerSheet("pick-customer", PickCustomer, "create-receipt");
registerSheet("pick-customer", PickCustomer);
registerSheet("create-receipt", CreateReceipt);
registerSheet("create-price-sheet-category", CreatePriceSheetCategory);
registerSheet("get-signature", GetSignature, "create-receipt");

export {};
