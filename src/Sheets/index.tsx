import { registerSheet } from "react-native-actions-sheet";
import { AddParts } from "./AddParts";
import { CreateReceipt } from "./CreateReceipt";
import { PickCustomer } from "./PickCustomer";

registerSheet("add-parts", AddParts, "local");
registerSheet("pick-customer", PickCustomer, "local");
registerSheet("create-receipt", CreateReceipt);

export {};
