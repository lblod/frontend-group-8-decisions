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

    return [
      {
        name: 'Luik-Bastenaken-Luik',
        org: 'Wielerbond',
        submissionDate: new Date('2024-11-17T03:24:00').toISOString(),
        startDate: new Date('2024-12-17T03:24:00').toISOString(),
      },
      {
        name: 'Ronde Van Vlaanderen',
        org: 'VZW Ronde Van Vlaanderen',

        submissionDate: new Date('2024-10-01T03:24:00').toISOString(),
        startDate: new Date('2025-01-17T03:24:00').toISOString(),
      },
    ];
  });
  contentResource = trackedTask(this, this.contentTask);
  get isLoading() {
    return this.args.isLoading || this.contentTask.isRunning;
  }
  get dataTableContent() {
    return this.contentResource.value;
  }
}
