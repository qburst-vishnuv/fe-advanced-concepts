/* eslint-disable no-restricted-globals */

let dataStore = null;

export const WorkerControls = Object.freeze({
  INIT: "INIT",
  INIT_COMPLETE: "INIT_COMPLETE",
  FILTER: "FILTER",
  FILTER_COMPLETE: "FILTER_COMPLETE"
});

class DataHelper {
  constructor(data, key, reqFields) {
    this.data = data || [];
    this.key = key;
    this.ids = [];
    this.trimmedData = {};
    this.reqData = [];
    this.trimFields = [];
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
    if (this.data && this.data.length > 0) {
      Object.keys(this.data[0]).forEach((key) => {
        if (this.reqFields && !this.reqFields.includes(key) && key !== this.key) {
          this.trimFields.push(key);
        }
      });
      return this.trimFields;
    }
    return [];
  }

  trimMetaData() {
    this.data.forEach((d, index) => {
      const id = d[this.key];
      this.ids[index] = id;

      // Extract metadata into trimmed store
      const freezeObj = {};
      this.trimFields.forEach((f) => {
        freezeObj[f] = d[f];
      });
      this.trimmedData[id] = Object.freeze(freezeObj);

      // Lightweight array containing only essential UI attributes
      this.reqData[index] = {
        id: id,
        symbol: d.symbol,
        amount: d.amount,
        price: d.price
      };
    });

    return this.ids;
  }

  get getReqData() {
    return this.reqData;
  }
}

self.onmessage = function ({ data }) {
  const { type, payload } = data;

  switch (type) {
    case WorkerControls.INIT: {
      // Strip metadata on worker thread
      dataStore = new DataHelper(payload, "id", ["amount", "price", "symbol"]);
      
      self.postMessage({
        type: WorkerControls.INIT_COMPLETE,
        data: dataStore ? dataStore.getReqData : []
      });
      break;
    }

    case WorkerControls.FILTER: {
      if (!dataStore) return;

      const { query } = payload;
      if (!query || query.trim() === "") {
        self.postMessage({
          type: WorkerControls.FILTER_COMPLETE,
          data: dataStore.getReqData
        });
        return;
      }

      const lowerCased = query.toLowerCase();

      const result = dataStore.reqData.filter((d) => 
        d.symbol.toLowerCase().includes(lowerCased)
      );

      // Send trimmed lightweight objects directly to main thread
      self.postMessage({
        type: WorkerControls.FILTER_COMPLETE,
        data: result
      });
      break;
    }

    default: {
      self.postMessage({
        type: 'DEFAULT',
        message: 'Worker received unhandled action type',
      });
      break;
    }
  }
};

export default self;