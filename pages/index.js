import { Component, Fragment } from 'react';
import {
  CreateToken, FilecoinBalancesList, CreateFilecoinAddress,
  ButtonSecondaryFull, SendAddressFilecoin, CreateFilecoinStorageDeal,
} from 'slate-react-system';
import { createPow } from "@textile/powergate-client";

const PowerGate = createPow({ host: "http://pow.slate.textile.io:6002" });
console.log('powergate======', PowerGate);
export default class Home extends Component {
  state = {
    token: null,
    info: null,
    loading: false,
  };

  // async componentDidMount() {
  //   console.log('1===');
  //   PowerGate.setToken('06de722b-e200-48b8-9093-04f91a184cdc');
  //   console.log('2===');
  //   const { addrsList } = await PowerGate.ffs.addrs();
  //   console.log('3===');
  //   console.log('addrsList======', addrsList);
  //   const { defaultStorageConfig } = await PowerGate.ffs.defaultStorageConfig();
  //   console.log('defaultStorageConfig======', defaultStorageConfig);
  //   const storageConfig = {
  //     repairable: false,
  //     cold: {
  //       enabled: false,
  //       filecoin: {
  //         ...defaultStorageConfig.cold.filecoin
  //       }
  //     },
  //     hot: {
  //       allowUnfreeze: false,
  //       enabled: true,
  //       ipfs: {
  //         addTimeout: 30
  //       },
  //     }
  //   };
  //   console.log('sotrageConfig======', storageConfig);
  //   this.setState({ defaultStorageConfig, addrsList }, () => {
  //     this._handleSave(storageConfig);
  //   });
  // }

  _handleCreateToken = async () => {
    console.log('createToken=====');
    const FFS = await PowerGate.ffs.create();
    console.log('createToken inside=====');
    const token = FFS.token ? FFS.token : null;
    console.log('token======', token);
    PowerGate.setToken(token);
    this.setState({ token });
  }

  _handleRefresh = async () => {
    const { info } = await PowerGate.ffs.info();
    this.setState({ info });
  }

  _handleCreateAddress = async ({ name, type, makeDefault }) => {
    const response = await PowerGate.ffs.newAddr(
      name, 
      type, 
      makeDefault
    );
    console.log('response======', response);
  }

  _handleSend = async ({ source, target, amount }) => {
    const response = await PowerGate.ffs.sendFil(
      source, 
      target, 
      amount
    );
  }

  _handleSubmit = async (data) => {
    this.setState({ loading: false });
    const file = data.file.files[0];
    var buffer = [];
    // NOTE(jim): A little hacky...
    const getByteArray = async () =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = function(e) {
          if (e.target.readyState == FileReader.DONE) {
            buffer = new Uint8Array(e.target.result);
          }
          resolve();
        };
        reader.readAsArrayBuffer(file);
      });
    await getByteArray();
    const { cid } = await PowerGate.ffs.stage(buffer);
    console.log('cid=====', cid);
    const { jobId } = await PowerGate.ffs.pushStorageConfig(cid);
    console.log('jobid======', jobId);
    const cancel = PowerGate.ffs.watchJobs((job) => {
    this.setState({ loading: false });
    console.log('job====', job);
    }, jobId);
  }

  getStorageConfig = async () => {
    // console.log('Powergate=====', PowerGate.ffs);
    const { config } = await PowerGate.ffs.getStorageConfig('QmTAznyH583xUgEyY5zdrPB2LSGY7FUBPDddWKj58GmBgp');
    console.log('config======', config);
  }

  _handleSave = async (storageConfig) => {
    console.log('storageConfig inside=====', storageConfig);
    console.log('Powergate=====', PowerGate.ffs);
    const response = await PowerGate.ffs.setDefaultStorageConfig(storageConfig);
    console.log('response======', response);
    const { defaultStorageConfig } = await PowerGate.ffs.defaultStorageConfig();
    console.log('default config insid======', defaultStorageConfig);
    // this.setState({ data });
  };

  render() {
    const { token, info } = this.state;
    // console.log('info=====', info && info.balancesList || []);
    return (
      <div className="container">
        <CreateToken 
          token={token} 
          onClick={this._handleCreateToken}
        />
        <ButtonSecondaryFull onClick={this._handleRefresh}>Refresh</ButtonSecondaryFull>
        {info && (
          <Fragment>
            <FilecoinBalancesList data={info.balancesList || []} />
            <CreateFilecoinAddress onSubmit={this._handleCreateAddress} />
            {/* <SendAddressFilecoin onSubmit={this._handleSend} /> */}
            <CreateFilecoinStorageDeal onSubmit={this._handleSubmit} />
            <button onClick={() => this.getStorageConfig()}>Get Storage Config</button>
          </Fragment>
        )}
        {/* <FilecoinSettings
          autoApprove={this.state.autoApprove}
          defaultStorageConfig={this.state.defaultStorageConfig}
          addrsList={this.state.addrsList}
          onSave={this._handleSave}
        /> */}
      </div>
    )
  }
}
