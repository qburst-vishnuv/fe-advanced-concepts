/* eslint-disable no-restricted-globals */

export const WorkerControls = Object.freeze({
    INIT: "INIT",
    INIT_COMPLETE: "INIT_COMPLETE",
    FILTER: "FILTER"
})


// 10K+ data 

class DataHelper {
    constructor(data,key,reqFields){
        this.data = data || [];
        this.key = key;
        this.ids = [];
        this.trimmedData = {};
        this.reqData = [];
        this.trimFileds = [];
        this.reqFields = reqFields;

        this.onInit();

    }

    get getIds() {
        return this.ids;
    }

    onInit() {
        this.ids = new Array(this.data.length);
        this.reqData = new Array(this.data.length);
        this.getFields();
        this.trimMetaData();

    }

    getFields() {

        if(this.data && this.data.length > 0) {
            console.log(this.data[0])

            Object.keys(this.data[0]).forEach((key) => {
                console.log(key, this.reqFields)
                if(this.reqFields ) {
                    if(!this.reqFields.includes(key)) {

                        this.trimFileds.push(key)
                    }
                }
            })
    
            return this.trimFileds;
        }
         return []

    }

    trimMetaData() {

        this.data.forEach( (d,index) => {
            this.ids[index] = d[this.key];

               const freezeobj = {};
               console.log("trim fields", this.trimFileds);

           this.trimFileds &&  this.trimFileds.forEach(f => freezeobj[f] = d[f])

            this.trimmedData[d[this.key]] = Object.freeze(freezeobj);
            this.reqData[index] = {
                id:d[this.key],
                symbol: d.symbol,
                amount: d.amount,
                price: d.price
            }

        })
        console.log("this", this)
        return this.ids;
    }

    get getReqData() {
        return this.reqData;
    }


}



self.onmessage = function({data, ...rest}) {

    const {
        type,
        payload
    } = data;

    let dataStore;


    switch(type){

        case WorkerControls.INIT: {
            // strip away all metadata;
            dataStore = new DataHelper(payload,"id",["amount","price","symbol"]);
            self.postMessage({
                type: WorkerControls.INIT_COMPLETE,
                data: dataStore.getReqData
            })

        }   
        
        default: {
            self.postMessage({
                type: 'DEFAULT',
                message: 'Worker received unhandled action type',
            });
        }
    }

};


export default self;