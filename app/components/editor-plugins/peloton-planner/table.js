import Component from '@glimmer/component';
/**
 * @typedef {Object} Args
 * @property {boolean} isLoading
 * */

/**
 * @extends {Component<Args>}
 */
export default class PelotonPlannerTableComponent extends Component {
  get isLoading() {
    return this.args.isLoading;
  }
}
