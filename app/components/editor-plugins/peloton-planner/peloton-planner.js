import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PelotonPlannerComponent extends Component {
  @tracked modalOpen = false;

  @action
  openModal() {
    this.modalOpen = true;
  }
  @action
  closeModal() {
    this.modalOpen = false;
  }
}
