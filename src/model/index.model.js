import { Schema, model } from "mongoose";

const dbSchema = new Schema({
    id:{ type: Number},
    is_bot:{type:Boolean},
    first_name:{type:String},
    language_code:{type:String},
    is_bot:{type:Boolean}
});

export default model("YoutubeInstagramDownloader", dbSchema);