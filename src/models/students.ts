import { RowDataPacket } from "mysql2";

export interface Student extends RowDataPacket{
    id?:number;
    name:string;
    surname:string;
    phone?:string;
    sex?:string;
    birthday?:Date;
    email?:string;
}