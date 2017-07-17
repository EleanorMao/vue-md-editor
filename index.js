import Editor from './src/main';

Editor.install = function (Vue) {
    Vue.component(Editor.name, Editor);
};

export default Editor;
