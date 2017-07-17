import Editor from './src/main';

Alert.install = function (Vue) {
    Vue.component(Editor.name, Editor);
};

export default Editor;