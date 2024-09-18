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
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX adms: <http://www.w3.org/ns/adms#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?uuid ?created ?modified ?creator ?status ?raceName ?startDate ?orgName
      WHERE {
        ?form a <http://lblod.data.gift/vocabularies/subsidie/ApplicationForm> ;
              mu:uuid ?uuid ;
              dct:created ?created ;
              dct:modified ?modified ;
              dct:creator ?creator ;
              adms:status ?status ;
              <http://data.lblod.info/form-data/nodes/e61f56db-6346-4a61-a75e-33e091789e40> ?raceName ;
              <http://data.lblod.info/form-data/nodes/fdd42a55-f190-4200-b8f4-f59928f8fd0c> ?startDate .

        ?creator foaf:member ?org .
        ?org skos:prefLabel ?orgName .
      }
      `,
      endpoint: 'https://pelotonplanner.hackathon-8.s.redhost.be/raw-sparql',
    });

    // Process the results
    const formattedResults = result.results.bindings.map(binding => ({
      name: binding.raceName ? binding.raceName.value : `Application ${binding.uuid.value}`,
      org: binding.orgName ? binding.orgName.value : 'Unknown',
      submissionDate: new Date(binding.created.value).toISOString(),
      startDate: new Date(binding.startDate.value).toISOString(),
      creator: binding.creator.value,
      status: binding.status.value,
      modified: new Date(binding.modified.value).toISOString()
    }));
    return formattedResults;
  });
  contentResource = trackedTask(this, this.contentTask);
  get isLoading() {
    return this.args.isLoading || this.contentTask.isRunning;
  }
  get dataTableContent() {
    return this.contentResource.value;
  }
}
