import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-gelinkt-notuleren/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | editor-plugins/data-filler/card',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<EditorPlugins::DataFiller::Card />`);

      assert.dom(this.element).hasText('');

      // Template block usage:
      await render(hbs`
      <EditorPlugins::DataFiller::Card>
        template block text
      </EditorPlugins::DataFiller::Card>
    `);

      assert.dom(this.element).hasText('template block text');
    });
  },
);
