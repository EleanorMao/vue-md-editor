<template>
    <div class="editor">
        <div class="editor-toolbar">
            <ul class="editor__menu clearfix">
                <li class="wmd-button" title="加粗 <strong> Ctrl+B">
                    <a class="fa fa-bold" @click="handleBold"></a>
                </li>
                <li class="wmd-button" title="斜体 <em> Ctrl+I">
                    <a class="fa fa-italic" @click="handleItalic"></a>
                </li>
                <li class="editor__menu--divider wmd-spacer1"></li>
                <li class="wmd-button" title="链接 <a> Ctrl+L">
                    <a class="fa fa-link" @click="handleLink"></a>
                </li>
                <li class="wmd-button" title="引用 <blockquote> Ctrl+Q">
                    <a class="fa fa-quote-left" @click="handleQuote"></a>
                </li>
                <li class="wmd-button" title="图片 <img> Ctrl+G">
                    <a class="fa fa-image" @click="handleImg"></a>
                </li>
                <li class="editor__menu--divider wmd-spacer2"></li>
                <li class="wmd-button" title="数字列表 <ol> Ctrl+O">
                    <a class="fa fa-list-ol" @click="handleOl"></a>
                </li>
                <li class="wmd-button" title="普通列表 <ul> Ctrl+U">
                    <a class="fa fa-list-ul" @click="handleUl"></a>
                </li>
                <li class="wmd-button" title="标题 <h1>/<h2> Ctrl+H">
                    <a class="fa fa-header" @click="handleTitle"></a>
                </li>
                <li class="wmd-button" title="分割线 <hr> Ctrl+R">
                    <a class="fa fa-hr" @click="handleHr">hr</a>
                </li>
                <li class="editor__menu--divider wmd-spacer3"></li>
                <li class="wmd-button" title="撤销 - Ctrl+Z">
                    <a class="fa fa-undo" :class="{ disabled: !cacheForUndo.length}" @click="handleUndo"></a>
                </li>
                <li class="wmd-button" title="重做 - Ctrl+Shift+Z">
                    <a class="fa fa-repeat" :class="{ disabled: !cacheForRedo.length}" @click="handleRedo"></a>
                </li>
            </ul>
        </div>
        <div class="wmd">
            <textarea placeholder="撰写内容..." class="mono el-textarea__inner form-control wmd-input" ref="editor" v-model="markdownText" @keydown="handleKeyDown" @paste="handlePaste"></textarea>
            <div class="editor-line"></div>
            <div class="editor-preview" v-html="html"></div>
        </div>
        <editorDialog title="插入链接" v-model="linkVisible" @sure="handleGetLink(true)" @cancel="handleGetLink(false)">
            <input v-model="link" type="text" placeholder="请输入链接地址..." class="editor-input" autofocus/>
        </editorDialog>
        <editorDialog title="上传图片" v-model="imgVisible" @sure="handleGetImg(true)" @cancel="handleGetImg(false)">
            <ul class="tab-list clearfix" @click="handleTab">
                <li class="active">
                    <a>上传图片</a>
                </li>
                <li>
                    <a>网络资源</a>
                </li>
            </ul>
            <ul class="tab-body">
                <li class="active">
                    <uploader name="imgUrl" :value="imgUrl" @success="handleSuccess"></uploader>
                </li>
                <li>
                    <input v-model="imgUrl" type="text" placeholder="请输入图片所在网址..." class="editor-input" autofocus/>
                </li>
            </ul>
        </editorDialog>
    </div>
</template>
<script>
import Dialog from './Dialog.vue';
const HyperDown = require('hyperdown');
const parser = new HyperDown;

export default {
    props: {
        placeholder: {
            type: String,
            default: '流星电波'
        },
        maxCache: {
            type: Number,
            default: 6
        },
        originText: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            link: "http://",
            linkVisible: false,
            imgUrl: "",
            imgVisible: false,
            markdownText: "",
            cacheForUndo: [],
            cacheForRedo: [],
        }
    },
    methods: {
        handleSuccess(url, name) {
            console.log(url)
            this[name] = url;
        },
        handleKeyDown(e) {
            const keyMap = window.event;
            const key = e.key.toUpperCase();
            if (keyMap.ctrlKey && !keyMap.shiftKey) {
                switch (key) {
                    case 'B':
                        this.handleBold();
                        break;
                    case 'G':
                        this.handleImg();
                        break;
                    case 'H':
                        this.handleTitle();
                        break;
                    case 'I':
                        this.handleItalic();
                        break;
                    case 'L':
                        this.handleLink();
                        break;
                    case 'O':
                        this.handleOl();
                        break;
                    case 'Q':
                        this.handleQuote();
                        break;
                    case 'R':
                        this.handleHr();
                        break;
                    case 'U':
                        this.handleUl();
                        break;
                    case 'Z':
                        this.handleUndo();
                        break;
                    default:
                        break;
                }
            } else if (keyMap.ctrlKey && keyMap.shiftKey && key === 'Z') {
                this.handleRedo();
            }

        },
        handleSetSelection(startOffset, endOffset) {
            const node = this.$refs.editor;
            node.focus();
            node.setSelectionRange(startOffset, endOffset);
        },
        handleBold() {
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = this.$refs.editor;

            let startText = markdownText.slice(0, selectionStart);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endText = markdownText.slice(selectionEnd);

            if (/^\*{2}[\s\S]+\*{2}$/.test(midText)) {
                midText = midText.replace(/^\*{2}|\*{2}$/g, "");
            } else if ((/\*{2}$/.test(startText) && /^\*{2}/.test(endText))) {
                startText = startText.replace(/\*{2}$/, "");
                endText = endText.replace(/^\*{2}/, "");
            } else {
                startText += "**";
                endText = "**" + endText;
            }

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
        },
        handleItalic() {
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = this.$refs.editor;

            let startText = markdownText.slice(0, selectionStart);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endText = markdownText.slice(selectionEnd);

            if (/^\*[\s\S]+\*$/.test(midText)) {
                midText = midText.replace(/^\*|\*$/g, "");
            } else if (/\*+$/.test(startText) && /^\*+/.test(endText)) {
                startText = startText.replace(/\*+$/, ($1, offset, str) => {
                    return $1.slice(1);
                })
                endText = endText.replace(/^\*+/, ($1, offset, str) => {
                    return $1.slice(1);
                })
            } else {
                startText += "*";
                endText = "*" + endText;
            }

            this.markdownText = startText + midText + endText;

            this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
        },
        handleLink() {
            const { selectionStart, selectionEnd } = this.$refs.editor;
            if (selectionStart !== selectionEnd) {
                const { markdownText } = this;
                let startText = markdownText.slice(0, selectionStart);
                let midText = markdownText.slice(selectionStart, selectionEnd);
                let endText = markdownText.slice(selectionEnd);
                if (/\[$/.test(startText) && /^]\([\s\S]*\)/.test(endText)) {
                    startText = startText.replace(/\[$/, "")
                    endText = endText.replace(/^]\([\s\S]*\)/, "")
                } else if (/^(\s*)\[[\s\S]*\]\([\s\S]*\)(\s*)$/.test(midText)) {
                    midText = midText.replace(/^(\s*)\[/, "").replace(/]\([\s\S]*\)(\s*)$/, "");
                }
                this.markdownText = startText + midText + endText;
                this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
            } else {
                this.linkVisible = true;
            }
        },
        handleGetLink(getLink) {
            const node = this.$refs.editor;
            if (!getLink) {
                this.link = "http://";
                node.focus();
                return;
            }

            const link = this.link;
            const length = link.length;
            this.link = "http://";

            const { selectionStart, selectionEnd } = node;
            const { markdownText, placeholder } = this;

            let startText = markdownText.slice(0, selectionStart);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endText = markdownText.slice(selectionEnd);

            startText += "[";
            endText = `](${encodeURI(link)})${endText}`;

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
        },
        handleImg() {
            const { selectionStart, selectionEnd } = this.$refs.editor;
            if (selectionStart !== selectionEnd) {
                const { markdownText } = this;
                let startText = markdownText.slice(0, selectionStart);
                let midText = markdownText.slice(selectionStart, selectionEnd);
                let endText = markdownText.slice(selectionEnd);
                if (/!\[$/.test(startText) && /^]\([\s\S]*\)/.test(endText)) {
                    startText = startText.replace(/!\[$/, "")
                    endText = endText.replace(/^]\([\s\S]*\)/, "")
                } else if (/^(\s*)!\[[\s\S]*\]\([\s\S]*\)(\s*)$/.test(midText)) {
                    midText = midText.replace(/^(\s*)!\[/, "").replace(/]\([\s\S]*\)(\s*)$/, "");
                }
                this.markdownText = startText + midText + endText;
                this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
            } else {
                this.imgVisible = true;
            }
        },
        handleGetImg(getLink) {
            const node = this.$refs.editor;
            if (!getLink) {
                this.imgUrl = "";
                node.focus();
                return;
            }

            const link = this.imgUrl;
            const length = link.length;
            this.imgUrl = "";

            const { selectionStart, selectionEnd } = node;
            const { markdownText, placeholder } = this;

            let startText = markdownText.slice(0, selectionStart);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endText = markdownText.slice(selectionEnd);

            startText += "![";
            endText = `](${encodeURI(link)})${endText}`;

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
        },
        handleQuote() {
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = this.$refs.editor;

            let startText = markdownText.slice(0, selectionStart);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endText = markdownText.slice(selectionEnd);
            let offset = 1;
            if ((!startText.length && />\s*[\s\S]+[\r\n\f]+$/.test(midText)) || (/\s*/.test(endText) && /[\r\n\f]+>\s*[\s\S]+[\r\n\f]*$/.test(midText))) {
                midText = midText.replace(/[\s]*>\s*|[\r\n\f]*$/g, "");
            } else if (/[\r\n\f]+>\s*$/.test(startText) || /^[\r\n\f]*>\s*$/.test(startText)) {
                offset = 0;
                startText = startText.replace(/[\r\n\f]*>\s*$/, "")
                endText = endText.replace(/^[\r\n\f]*/, "")
            } else {
                startText += startText.length ? "\n> " : "> ";
                endText = "\n" + endText;
            }

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length - offset, startText.length + midText.length + offset))
        },
        handleOl() {
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = this.$refs.editor;

            let startLine = markdownText.slice(0, selectionStart).split(/[\r\n]/);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endLine = markdownText.slice(selectionEnd).split(/[\r\n]/);

            startLine[startLine.length - 1] === "" && startLine.pop();
            endLine[0] === "" && endLine.shift();

            let startLength = startLine.length;
            let startLineLast = startLength ? startLine[startLength - 1] : "";
            if (/^(\s*)[1-9]+\.\s+[\s\S]+$/.test(midText) || /^(\s*)[1-9]+\.(\s+)$/.test(startLineLast)) {
                startLine.pop();
                startLine.push("");
                midText = midText.replace(/^(\s*)[1-9]+\.\s+/, "");
            } else {
                let listIndex = startLineLast.match(/^(\s*)[1-9]+/);
                listIndex = listIndex ? `${parseInt(listIndex[0]) + 1}. ` : '1. ';
                startLine.push(`${listIndex} `);
            }

            let lastStartIndex = startLine[startLine.length - 1].match(/^(\s*)[1-9]+/);
            lastStartIndex = lastStartIndex ? lastStartIndex[0] : 0;
            let i = 0;
            while (parseInt(lastStartIndex) !== 0) {
                if (/^(\s*)[1-9]+\s+[\s\S]*$/.test(endLine[i])) {
                    endLine[i] = endLine[i].replace(/^(\s*)[1-9]+/, ($1) => {
                        return `${parseInt($1) + 1}`;
                    })
                    i++;
                } else {
                    lastStartIndex = 0;
                }
            }

            let startText = startLine.join('\n');
            let endText = (endLine.length > 0 ? '\n' : "") + endLine.join('\n');

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length - 1, startText.length + midText.length))
        },
        handleUl() {
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = this.$refs.editor;

            let startLine = markdownText.slice(0, selectionStart).split(/[\r\n]/);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endLine = markdownText.slice(selectionEnd).split(/[\r\n]/);

            startLine[startLine.length - 1] === "" && startLine.pop();
            endLine[0] === "" && endLine.shift();

            let startLength = startLine.length;
            let startLineLast = startLength ? startLine[startLength - 1] : "";
            if (/^(\s*)[\*\-\+]+\s+[\s\S]+$/.test(midText) || /^(\s*)[\*\-\+]+(\s+)$/.test(startLineLast)) {
                startLine.pop();
                startLine.push("");
                midText = midText.replace(/^(\s*)[\*\-\+]+\s+/, "");
            } else {
                let listIndex = startLineLast.match(/^(\s*)[\*\-\+]+/);
                listIndex = listIndex ? `${listIndex[0]} ` : '- ';
                startLine.push(`${listIndex} `);
            }

            let startText = startLine.join('\n');
            let endText = (endLine.length > 0 ? '\n' : "") + endLine.join('\n');

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length - 1, startText.length + midText.length))
        },
        handleTitle() {
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = this.$refs.editor;

            let startText = markdownText.slice(0, selectionStart);
            let midText = markdownText.slice(selectionStart, selectionEnd) || placeholder;
            let endText = markdownText.slice(selectionEnd);

            let hasBreakInStart = !startText.length || /[\r\n\f]+$/.test(startText);

            if (/^[\s\S]*[\r\n\f]+={2,}$/.test(midText)) {
                midText = midText.replace(/=+$/, "----");
            } else if (/^[\s\S]*[\r\n\f]+-{2,}$/.test(midText)) {
                midText = "## " + midText.replace(/[\r\n\f]*-+$/, " ##");
            } else if (/^#{1,6}[\s\S]*(#{1,6})$/.test(midText)) {
                midText = midText.replace(/^#{1,6}\s*/, "").replace(/\s*#{1,6}$/, "");
            } else if ((/[\r\n\f]+$/.test(midText) && /^={2,}/.test(endText)) || /^[\r\n\f]+={2,}/.test(endText)) {
                endText = endText.replace(/=+/, "----");
            } else if ((/[\r\n\f]+$/.test(midText) && /^-{2,}/.test(endText)) || /^[\r\n\f]+-{2,}/.test(endText)) {
                startText = startText + (hasBreakInStart ? "" : "\n") + "## ";
                midText = midText.replace(/[\r\n\f]*/g, "");
                endText = endText.replace(/^[\r\n\f]*-+/, " ##");
            } else if (/#{1,6}(\s*)$/.test(startText)) {
                startText = startText.replace(/#{1,6}(\s*)$/, "");
                endText = endText.replace(/^(\s*)#{1,6}/, "");
            } else {
                startText = startText + (hasBreakInStart ? "" : "\n");
                endText = "\n====" + (/^[\r\n\f]+/.test(endText) ? "" : "\n") + endText;
            }

            this.markdownText = startText + midText + endText;
            this.$nextTick(this.handleSetSelection.bind(this, startText.length, startText.length + midText.length))
        },
        handleHr() {
            const node = this.$refs.editor;
            const { markdownText, placeholder } = this;
            const { selectionStart, selectionEnd } = node;

            this.markdownText = `${markdownText.slice(0, selectionStart)}${selectionStart && '\n\n' || ''}----\n${markdownText.slice(selectionEnd)}`;
            node.focus();
        },
        handleRedo() {
            if (this.cacheForRedo.length) {
                let cache = this.cacheForRedo.pop();
                this.markdownText = cache;
            }
        },
        handleUndo() {
            let { cacheForRedo, cacheForUndo, markdownText, maxCache } = this;
            if (cacheForUndo.length) {
                let cache = cacheForUndo.pop();
                cacheForRedo.push(markdownText);
                this.markdownText = cache;
                if (cacheForRedo.length > maxCache) {
                    cacheForRedo.shift();
                }
            }
        },
        handlePaste(e) {
            let clip = e.clipboardData;
            for (let i = clip.items.length; i--;) {
                let item = clip.items[i];
                if (item.kind == 'file' && ~item.type.indexOf('image')) {
                    let img = item.getAsFile();
                    this.upload(img)
                }
            }
        },
        handleTab(e) {
            let siblings = e.currentTarget.children;
            let current = e.target.parentElement;
            let body = current.parentElement.nextElementSibling.children;
            let index = -1;
            for (let i = siblings.length; i--;) {
                let item = siblings[i];
                let bodyItem = body[i];
                if (item === current) {
                    index = i;
                    bodyItem.setAttribute("class", "active");
                    item.setAttribute("class", "active");
                } else {
                    bodyItem.setAttribute("class", "");
                    item.setAttribute("class", "");
                }
            }
        },
        getFormData(data) {
            let formData = new FormData();
            Object.keys(data).map(key => {
                formData.append(key, data[key]);
            });
            return formData;
        },
        upload(file) {
            //TODO: spark-md5 md5这个图片
            const imageData = this.getFormData({ type: 1, size: file.size, md5: 'test' });
            this.$http.post('file/image', imageData, { emulateJSON: false, before: this.$load }).then(res => {
                const data = {
                    policy: res.body.data.policy,
                    "save-key": res.body.data.short,
                    signature: res.body.data.signature,
                    file: file
                };

                const formData = this.getFormData(data);

                this.$http.post(
                    "http://v0.api.upyun.com/baxga",
                    formData,
                    {
                        emulateJSON: false,
                        before(req) {
                            delete req.headers.map['Authorization-Token'];
                        }
                    })
                    .then(res => {
                        this.imgUrl = `${process.env.imgPath}${JSON.parse(res.body).url}`;
                        this.handleGetImg(true);
                    }, (error) => {
                        this.handleGetImg(false);
                        this.$message.error(`上传失败！ ${JSON.parse(error.body).message}`)
                    }).then(this.$close)
            })
        },
    },
    watch: {
        markdownText: {
            handler(newValue, oldValue) {
                let { cacheForRedo, cacheForUndo, maxCache } = this;
                let length = cacheForRedo.length;
                if (!length || oldValue !== cacheForRedo[length - 1]) {
                    cacheForUndo.push(oldValue);
                    if (cacheForUndo.length > maxCache) {
                        cacheForUndo.shift();
                    }
                }
            },
            deep: true
        },
        originText(val) {
            this.markdownText = val;
        }
    },
    computed: {
        html() {
            let parsed = parser.makeHtml(this.markdownText);
            this.$emit("change", this.markdownText, parsed);
            return parsed
        }
    },
    components: {
        editorDialog: Dialog
    }
}


</script>
<style lang="less">
.editor {
    position: relative;
    z-index: 1;
    min-height: 300px;
    border: 1px solid #e0e6ed;
    border-radius: 3px;
    margin: 20px 0;
    * {
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }
    .editor-toolbar {
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 106;
        border-bottom: 1px solid #e0e6ed;
    }
    .editor__menu {
        list-style: none;
        margin: 0;
        padding: 0 5px;
        background-color: #fff;
        .editor__menu--divider {
            margin: 5px 4px;
            width: 0;
            height: 30px;
            padding-left: 0;
            padding-right: 0;
            border-right: 1px solid #ddd;
            text-indent: 110%;
            white-space: nowrap;
            overflow: hidden;
            text-transform: capitalize;
        }
        li {
            float: left;
            margin: 0 2px;
            vertical-align: text-top;
        }
        a {
            cursor: pointer;
            display: block;
            color: #666;
            border: 5px solid #fff;
            width: 30px;
            height: 30px;
            white-space: nowrap;
            overflow: hidden;
            text-align: center;
            line-height: 30px;
            text-transform: capitalize;
            box-sizing: content-box;
            &.disabled {
                color: #999;
                cursor: not-allowed;
            }
            &.fa-hr {
                font-size: xx-small;
                text-decoration: underline;
            }
        }
    }
    .wmd {
        width: 100%;
        margin-top: 42px;
        position: relative;
        overflow: hidden;
        background-color: #fff;
        height: auto;
        min-height: 420px;
        padding: 0;
        top: 0;
        border-right: none;
        -webkit-transition: width .3s ease;
        transition: width .3s ease;
    }
    .editor-line,
    .editor-preview {
        left: 50%;
        top: 0;
        bottom: 0;
        border-left: 1px solid #e0e6ed;
        position: absolute;
        height: 100%;
        z-index: 105;
    }
    .wmd-input {
        width: 50%;
        height: 100%;
        min-height: 420px;
        overflow: auto;
        border: none;
        .form-control {
            border-radius: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
        }
        &.mono.form-control {
            padding: 10px 20px !important;
            resize: none;
            -moz-tab-size: 4;
            -o-tab-size: 4;
            tab-size: 4;
        }
    }
    .editor-preview {
        overflow: auto;
        width: 50%;
        padding: 10px 20px;
        background-color: #EFF2F7;
        color: #1f2d3d;
        z-index: 100;
        word-break: break-all;
        h1,
        h2,
        h3 {
            margin-bottom: 0;
            margin-top: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e6ed;
        }
        h4,
        h5,
        h6 {
            margin: 10px 0;
        }
        h1 {
            font-size: 3.5em;
        }
        h2 {
            font-size: 3em;
        }
        h3 {
            font-size: 2.5em;
        }
        h4 {
            font-size: 2em;
        }
        h5 {
            font-size: 1.5em;
        }
        h6 {
            font-size: 1em;
        }
        p {
            margin: 0;
        }
        a {
            font-weight: 700;
            &:hover {
                color: #1D8CE0;
            }
        }
        img {
            padding: 5px;
            border: 1px solid #99A9BF;
            max-width: 100%;
            background: #f9f9f9;
        }
        hr {
            margin: 1em auto;
            border-top: 2px solid #99A9BF;
        }
        strong {
            font-weight: 700;
        }
        blockquote {
            border-left: 3px solid #58B7FF;
            background: #E5E9F2;
            color: #555;
            font-size: 1em;
            margin: 10px 0;
            padding: 10px 20px;
        }
        ul,
        ol {
            margin-left: 3em;
            padding-left: 0;
            overflow: visible;
        }
        ul li,
        ol li {
            margin: .3em 0;
            list-style: inherit;
        }
        ul ul,
        ol ol {
            margin-top: 0;
            margin-bottom: 0;
        }
        &>h1:first-child,
        >h2:first-child,
        >h3:first-child,
        >h4:first-child,
        >h5:first-child,
        >h6:first-child {
            margin-top: 0;
        }
    }
    .editor-input {
        display: block;
        padding: 3px 10px;
        box-sizing: border-box;
        width: 100%;
        height: 36px;
        color: #1f2d3d;
        background-color: #fff;
        background-image: none;
        border: 1px solid #c0ccda;
        border-radius: 4px;
        transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
        outline: none;
        font-size: inherit;
        line-height: normal;
        &:hover {
            border-color: #8492a6;
        }
    }
    .tab-list {
        border-bottom: 1px solid #c0ccda;
        overflow: visible;
        >li {
            float: left;
            margin-bottom: -1px;
            margin-right: 2px;
            >a {
                display: block;
                padding: 0 15px;
                border-top-left-radius: 2px;
                border-top-right-radius: 2px;
                border: 1px solid #c0ccda;
                cursor: default;
            }
            &.active>a {
                color: #555;
                border-bottom-color: #fff;
            }
        }
    }
    .tab-body>li {
        padding: 20px;
        border: 1px solid #c0ccda;
        border-top: none;
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
        display: none;
        &.active {
            display: block;
        }
    }
}
</style>