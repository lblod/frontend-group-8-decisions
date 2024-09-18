import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { executeQuery } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  Place,
  Point,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
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
    const formattedResults = result.results.bindings.map((binding) => ({
      name: binding.raceName
        ? binding.raceName.value
        : `Application ${binding.uuid.value}`,
      org: binding.orgName ? binding.orgName.value : 'Unknown',
      submissionDate: new Date(binding.created.value).toISOString(),
      startDate: new Date(binding.startDate.value).toISOString(),
      creator: binding.creator.value,
      status: binding.status.value,
      modified: new Date(binding.modified.value).toISOString(),

      startLocation: new Place({
        uri: 'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/8dc860be-f484-4069-a7ad-558d183ded22',
        name: 'Vlaanderenstraat',

        location: new Point({
          uri: 'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/353b61ce-6a14-4e69-8382-e3e93ae3319d',
          location: {
            lambert: {
              x: 149333.41117988116,
              y: 189140.505624027,
            },
            global: {
              lat: 51.01247071937453,
              lng: 4.359256065026602,
            },
          },
        }),
      }),
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
