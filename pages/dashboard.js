import * as React from "react";
import { CreateFilecoinStorageDeal } from "slate-react-system";
import { createPow } from "@textile/powergate-client";

const PowerGate = createPow({ host: "http://pow.slate.textile.io:6002" });

export default class Example extends React.Component {
  componentDidMount = async () => {
    const FFS = await PowerGate.ffs.create();
    const token = FFS.token ? FFS.token : null;
    PowerGate.setToken(token);
    this.setState({ token });
  };
  _handleSubmit = async (data) => {
    const file = data.file.files[0];
    var buffer = [];
    // NOTE(jim): A little hacky...
    const getByteArray = async () =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = function (e) {
          if (e.target.readyState == FileReader.DONE) {
            buffer = new Uint8Array(e.target.result);
          }
          resolve();
        };
        reader.readAsArrayBuffer(file);
      });
    await getByteArray();
    const { cid } = await PowerGate.ffs.stage(buffer);
    const { jobId } = await PowerGate.ffs.pushStorageConfig(cid);
    const cancel = PowerGate.ffs.watchJobs((job) => {
      console.log('job====', job);
    }, jobId);
  };
  render() {
    return <CreateFilecoinStorageDeal onSubmit={this._handleSubmit} />;
  }
}
