import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Fragment, Slice } from '@lblod/ember-rdfa-editor';
import {
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
/**
 * @typedef {Object} Args
 * @property {import('@lblod/ember-rdfa-editor').SayController} controller
 */

/** @typedef {import('@lblod/ember-rdfa-editor').PNode} PNode */
/** @typedef {import('@lblod/ember-rdfa-editor').Schema} Schema */
/** @typedef {import('@lblod/ember-rdfa-editor').Transaction} Transaction */
/** @typedef {import('@lblod/ember-rdfa-editor').NamedNode} NamedNode */
/** @typedef {import('@lblod/ember-rdfa-editor/core/rdfa-processor').OutgoingTriple} OutgoingTriple */

// TODO: [hack] rather than hardcoding, the nodes themselves would carry an
// flag to opt in to the data-filler feature
// In the end this is simply a performance tweak, so that we don't have to
// analyse every single node.
const VARIABLE_NODE_TYPES = [
  'text_variable',
  'number',
  'date',
  'oslo_location',
];
/**
 * @typedef {Object} ReplacerSpec
 * @property {string} type
 * @property {string?} label
 * @property {((node: PNode) => boolean)?} filter
 * @property {(tr: Transaction, schema: Schema, node: PNode, pos: number) => Transaction} replacer
 */

/**
 * TODO: [hack] clearly this would need some supporting utils for easy
 * configuration and to avoid duplicated code
 * @type{ReplacerSpec[]} */
const REPLACER_SPECS = [
  {
    type: 'text_variable',
    label: 'organisator',
    replacer: (tr, schema, node, pos, raceRequest) => {
      tr.replaceRangeWith(
        pos,
        pos + node.nodeSize,
        node.replace(
          0,
          node.nodeSize - 2,
          new Slice(Fragment.fromArray([schema.text(raceRequest.org)]), 0, 0),
        ),
      );
      return tr;
    },
  },
  {
    type: 'text_variable',
    label: 'evenementnaam',
    replacer: (tr, schema, node, pos, raceRequest) => {
      tr.replaceRangeWith(
        pos,
        pos + node.nodeSize,
        node.replace(
          0,
          node.nodeSize - 2,
          new Slice(Fragment.fromArray([schema.text(raceRequest.name)]), 0, 0),
        ),
      );
      return tr;
    },
  },
  {
    type: 'date',
    label: 'indiendatum',
    replacer: (tr, _schema, node, pos, raceRequest) => {
      console.log('setting date', new Date().toISOString());
      tr.setNodeAttribute(
        pos,
        'properties',
        changeRdfaProp(
          node.attrs.properties,
          EXT('content'),
          raceRequest.submissionDate,
          XSD('date').namedNode,
        ),
      );
      return tr;
    },
  },
  {
    type: 'date',
    label: 'starttijd',
    replacer: (tr, _schema, node, pos, raceRequest) => {
      console.log('setting date', new Date().toISOString());
      tr.setNodeAttribute(
        pos,
        'properties',
        changeRdfaProp(
          node.attrs.properties,
          EXT('content'),
          raceRequest.startDate,
          XSD('date').namedNode,
        ),
      );
      return tr;
    },
  },
  {
    type: 'oslo_location',
    filter(node) {
      // TODO: [hack] the matching is a bit brittle (doesn't support prefixed
      // string, for example) but this demonstrates that we can use rdfa
      // knowledge to drive the filler logic, not just arbitrary labels
      return !!node.attrs.backlinks?.find(
        (backlink) =>
          backlink.predicate ===
          'http://dbpedia.org/ontology/routeStartLocation',
      );
    },

    replacer: (tr, _schema, node, pos, raceRequest) => {
      console.log('replacing node', node);
      return tr;
    },
  },
];
/**
 * @param {OutgoingTriple[]} properties
 * @param {Resource} predicate
 * @param {string} newValue
 * @param {string | NamedNode} dataTypeOrLanguage
 * @returns {OutgoingTriple[]}
 */
function changeRdfaProp(properties, predicate, newValue, dataTypeOrLanguage) {
  /** @type {OutgoingTriple[]} */
  let newProps = [...properties];
  let found = false;
  for (const trip of newProps) {
    if (predicate.matches(trip.predicate)) {
      found = true;
      if (trip.object.termType === 'Literal') {
        trip.object.value = newValue;
        if (typeof dataTypeOrLanguage === 'string') {
          trip.object.language = dataTypeOrLanguage;
        } else {
          trip.object.datatype = dataTypeOrLanguage;
        }
      }
    }
  }

  if (!found) {
    /** @type {OutgoingTriple} */
    const newTriple = {
      predicate: predicate.full,
      object: { value: newValue, termType: 'Literal' },
    };
    if (typeof dataTypeOrLanguage === 'string') {
      newTriple.object.language = dataTypeOrLanguage;
    } else {
      newTriple.object.datatype = dataTypeOrLanguage;
    }

    newProps = [...newProps, newTriple];
  }
  console.log('new props', newProps);
  return newProps;
}

/**
 * @extends {Component<Args>}
 */
export default class EditorPluginsDataFillerCardComponent extends Component {
  @tracked modalOpen = false;

  get controller() {
    return this.args.controller;
  }
  replaceNodes = (raceRequest) => {
    /** @type {{node: PNode, pos: number}[]} */
    const nodesWithPos = [];
    this.controller.mainEditorState.doc.descendants((node, pos) => {
      // TODO: [hack] this would not be hardcoded, rather a property on each
      // node to opt-in to this mechanism
      if (VARIABLE_NODE_TYPES.includes(node.type.name)) {
        nodesWithPos.push({ node: node, pos: pos });
      }
      return true;
    });
    // editing back-to-front is easier because it preserves positions in the
    // document
    nodesWithPos.reverse();
    this.controller.withTransaction((tr) => {
      for (const { node, pos } of nodesWithPos) {
        for (const spec of REPLACER_SPECS) {
          if (node.type.name === spec.type) {
            const filterWasTrue = spec.filter?.(node);
            const labelMatch =
              spec.label &&
              getOutgoingTriple(node.attrs, EXT('label'))?.object.value ===
                spec.label;
            if (filterWasTrue || labelMatch) {
              spec.replacer(tr, this.controller.schema, node, pos, raceRequest);
            }
          }
        }
      }
      return tr;
    });
  };
  openModal = () => {
    this.modalOpen = true;
  };
  closeModal = () => {
    this.modalOpen = false;
  };
  fillRaceRequest = (raceRequest) => {
    console.log('Selected request', raceRequest);
    this.replaceNodes(raceRequest);
    this.closeModal();
  };
}
