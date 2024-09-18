import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { executeQuery } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
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
    // TODO: [hack] endpoint should obviously be configurable here
    const result = await executeQuery({
      query: `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT * WHERE {
  <http://data.lblod.info/id/application-forms/66EA9681453552245DF73E08> ?p ?v.
} LIMIT 1000
`,
      endpoint: 'https://pelotonplanner.hackathon-8.s.redhost.be/raw-sparql',
    });
    console.log(result);

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
