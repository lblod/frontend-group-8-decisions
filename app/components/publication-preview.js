import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PublicationPreviewComponent extends Component {
  @service intl;
  get statusSkin() {
    if (this.args.status === 'published') return 'action';
    else if (
      this.args.status === 'firstSignature' ||
      this.args.status === 'secondSignature'
    )
      return 'success';
    else return null;
  }
  get statusLabel() {
    if (this.args.status === 'published') {
      return this.intl('publish.public-version');
    } else if (this.args.status === 'firstSignature') {
      return this.intl('publish.need-second-signature');
    } else if (this.args.status === 'secondSignature')
      return this.intl('publish.signed-version');
    else return '';
  }
}
