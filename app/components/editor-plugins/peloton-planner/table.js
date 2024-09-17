import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
/**
 * @typedef {Object} Args
 * @property {boolean} isLoading
 * */

/**
 * @extends {Component<Args>}
 */
export default class PelotonPlannerTableComponent extends Component {
  contentTask = task(async () => {
    await timeout(1000);
    //TODO SPARQL query HERE
    return [{ name: 'test' }];
  });
  contentResource = trackedTask(this, this.contentTask);
  get isLoading() {
    return this.args.isLoading || this.contentTask.isRunning;
  }
  get dataTableContent() {
    return this.contentResource.value;
  }
}
