import { connect } from "mongoose";
import { config } from "dotenv";

config();

export const connectdb = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("connected to DB");
    } catch (error) {
        console.log(error.message);
    }
};
