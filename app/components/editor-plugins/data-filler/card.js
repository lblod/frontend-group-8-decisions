import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Fragment, Slice } from '@lblod/ember-rdfa-editor';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
/**
 * @typedef {Object} Args
 * @property {import('@lblod/ember-rdfa-editor').SayController} controller
 */

/** @typedef {import('@lblod/ember-rdfa-editor').PNode} PNode */
/** @typedef {import('@lblod/ember-rdfa-editor').Schema} Schema */

const VARIABLE_NODE_TYPES = [
  'text_variable',
  'number',
  'date',
  'oslo_location',
];
/**
 * @typedef {Object} ReplacerSpec
 * @property {string} type
 * @property {string} label
 * @property {(node: PNode, schema: Schema) => PNode} replacer
 */

/** @type{ReplacerSpec[]} */
const REPLACER_SPECS = [
  {
    type: 'text_variable',
    label: 'organisator',
    replacer: (node, schema) => {
      return node.replace(
        0,
        1,
        new Slice(Fragment.fromArray([schema.text('test-org')]), 0, 0),
      );
    },
  },
  {
    type: 'text_variable',
    label: 'evenementnaam',
    replacer: (node, schema) => {
      return node.replace(
        0,
        1,
        new Slice(
          Fragment.fromArray([schema.text('Koers Luik-Bastenaken-Luik')]),
          0,
          0,
        ),
      );
    },
  },
];

/**
 * @extends {Component<Args>}
 */
export default class EditorPluginsDataFillerCardComponent extends Component {
  @tracked modalOpen = false;

  get controller() {
    return this.args.controller;
  }
  replaceNodes = () => {
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
          if (
            node.type.name === spec.type &&
            getOutgoingTriple(node.attrs, EXT('label'))?.object.value ===
              spec.label
          ) {
            tr.replaceRangeWith(
              pos,
              pos + node.nodeSize,
              spec.replacer(node, this.controller.schema),
            );
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
    this.closeModal();
  };
}
