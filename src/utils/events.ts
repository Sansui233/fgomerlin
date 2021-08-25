import { EventEmitter } from 'events';

// used when sharing the same event name in bi-direction communication
export enum EvtSources {
  ServantSidebar,
  ServatContent,
}

export enum EvtNames {
  ModifyServant = "modify servant",
  ModifyItem = "modify item"
}

export type ServantState = { id: number, isFollow?: boolean, skills?: number[] }
export type ItemState = { id: number, num: number }
export type EvtArgTypes = ServantState | ItemState


/**
 * Some notation in module 'events' went wrong so
 */
class DataEventEmitter extends EventEmitter {

  // Javascript don't support overloaded function, you have to choose a different name
  dataEmit(e: EvtNames, src: EvtSources, state: EvtArgTypes): boolean {
    return this.emit(e, src, state)
  }

  addDataListener(e: EvtNames, listener: (src: EvtSources, state: EvtArgTypes) => void): any {
    return this.addListener(e, listener)
  }

}

const Emitter = new DataEventEmitter()
export default Emitter;