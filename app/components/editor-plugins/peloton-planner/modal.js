import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PelotonPlannerModalComponent extends Component {
  @action
  closeModal() {
    this.args.closeModal();
  }
}
