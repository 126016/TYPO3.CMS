!function(e){"object"==typeof exports&&"object"==typeof module?e(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],e):e(CodeMirror)}(function(e){"use strict";e.defineMode("julia",function(e,t){function n(e,t){return void 0===t&&(t="\\b"),new RegExp("^(("+e.join(")|(")+"))"+t)}var r=t.operators||n(["[<>]:","[<>=]=","<<=?",">>>?=?","=>","->","\\/\\/","[\\\\%*+\\-<>!=\\/^|&\\u00F7\\u22BB]=?","\\?","\\$","~",":","\\u00D7","\\u2208","\\u2209","\\u220B","\\u220C","\\u2218","\\u221A","\\u221B","\\u2229","\\u222A","\\u2260","\\u2264","\\u2265","\\u2286","\\u2288","\\u228A","\\u22C5","\\b(in|isa)\\b(?!.?\\()"],""),i=t.delimiters||/^[;,()[\]{}]/,a=t.identifiers||/^[_A-Za-z\u00A1-\u2217\u2219-\uFFFF][\w\u00A1-\u2217\u2219-\uFFFF]*!*/,o=n(["\\\\[0-7]{1,3}","\\\\x[A-Fa-f0-9]{1,2}","\\\\[abefnrtv0%?'\"\\\\]","([^\\u0027\\u005C\\uD800-\\uDFFF]|[\\uD800-\\uDFFF][\\uDC00-\\uDFFF])"],"'"),c=n(["begin","function","type","struct","immutable","let","macro","for","while","quote","if","else","elseif","try","finally","catch","do"]),s=n(["end","else","elseif","catch","finally"]),u=n(["if","else","elseif","while","for","begin","let","end","do","try","catch","finally","return","break","continue","global","local","const","export","import","importall","using","function","where","macro","module","baremodule","struct","type","mutable","immutable","quote","typealias","abstract","primitive","bitstype"]),l=n(["true","false","nothing","NaN","Inf"]),f=/^@[_A-Za-z][\w]*/,m=/^:[_A-Za-z\u00A1-\uFFFF][\w\u00A1-\uFFFF]*!*/,h=/^(`|([_A-Za-z\u00A1-\uFFFF]*"("")?))/;function p(e){return d(e,"[")}function d(e,t){var n=v(e),r=v(e,1);return void 0===t&&(t="("),n===t||r===t&&"for"===n}function v(e,t){return void 0===t&&(t=0),e.scopes.length<=t?null:e.scopes[e.scopes.length-(t+1)]}function k(e,t){if(e.match(/^#=/,!1))return t.tokenize=g,t.tokenize(e,t);var n=t.leavingExpr;if(e.sol()&&(n=!1),t.leavingExpr=!1,n&&e.match(/^'+/))return"operator";if(e.match(/\.{4,}/))return"error";if(e.match(/\.{1,3}/))return"operator";if(e.eatSpace())return null;var o=e.peek();if("#"===o)return e.skipToEnd(),"comment";"["===o&&t.scopes.push("["),"("===o&&t.scopes.push("(");var z,A=v(t);if(p(t)&&"]"===o&&("for"===A&&t.scopes.pop(),t.scopes.pop(),t.leavingExpr=!0),d(t)&&")"===o&&("for"===A&&t.scopes.pop(),t.scopes.pop(),t.leavingExpr=!0),p(t)){if("end"==t.lastToken&&e.match(/^:/))return"operator";if(e.match(/^end/))return"number"}if((z=e.match(c,!1))&&t.scopes.push(z[0]),e.match(s,!1)&&t.scopes.pop(),e.match(/^::(?![:\$])/))return t.tokenize=F,t.tokenize(e,t);if(!n&&e.match(m)||e.match(/:([<>]:|<<=?|>>>?=?|->|\/\/|\.{2,3}|[\.\\%*+\-<>!\/^|&]=?|[~\?\$])/))return"builtin";if(e.match(r))return"operator";if(e.match(/^\.?\d/,!1)){var E=RegExp(/^im\b/),y=!1;if(e.match(/^\d*\.(?!\.)\d*([Eef][\+\-]?\d+)?/i)&&(y=!0),e.match(/^\d+\.(?!\.)\d*/)&&(y=!0),e.match(/^\.\d+/)&&(y=!0),e.match(/^0x\.[0-9a-f]+p[\+\-]?\d+/i)&&(y=!0),e.match(/^0x[0-9a-f]+/i)&&(y=!0),e.match(/^0b[01]+/i)&&(y=!0),e.match(/^0o[0-7]+/i)&&(y=!0),e.match(/^[1-9]\d*(e[\+\-]?\d+)?/)&&(y=!0),e.match(/^0(?![\dx])/i)&&(y=!0),y)return e.match(E),t.leavingExpr=!0,"number"}if(e.match(/^'/))return t.tokenize=x,t.tokenize(e,t);if(e.match(h))return t.tokenize=function(e){'"""'===e.substr(-3)?e='"""':'"'===e.substr(-1)&&(e='"');return function(t,n){if(t.eat("\\"))t.next();else{if(t.match(e))return n.tokenize=k,n.leavingExpr=!0,"string";t.eat(/[`"]/)}return t.eatWhile(/[^\\`"]/),"string"}}(e.current()),t.tokenize(e,t);if(e.match(f))return"meta";if(e.match(i))return null;if(e.match(u))return"keyword";if(e.match(l))return"builtin";var P=t.isDefinition||"function"==t.lastToken||"macro"==t.lastToken||"type"==t.lastToken||"struct"==t.lastToken||"immutable"==t.lastToken;return e.match(a)?P?"."===e.peek()?(t.isDefinition=!0,"variable"):(t.isDefinition=!1,"def"):e.match(/^({[^}]*})*\(/,!1)?(t.tokenize=b,t.tokenize(e,t)):(t.leavingExpr=!0,"variable"):(e.next(),"error")}function b(e,t){var n=e.match(/^(\(\s*)/);if(n&&(t.firstParenPos<0&&(t.firstParenPos=t.scopes.length),t.scopes.push("("),t.charsAdvanced+=n[1].length),"("==v(t)&&e.match(/^\)/)&&(t.scopes.pop(),t.charsAdvanced+=1,t.scopes.length<=t.firstParenPos)){var r=e.match(/^(\s*where\s+[^\s=]+)*\s*?=(?!=)/,!1);return e.backUp(t.charsAdvanced),t.firstParenPos=-1,t.charsAdvanced=0,t.tokenize=k,r?"def":"builtin"}if(e.match(/^$/g,!1)){for(e.backUp(t.charsAdvanced);t.scopes.length>t.firstParenPos;)t.scopes.pop();return t.firstParenPos=-1,t.charsAdvanced=0,t.tokenize=k,"builtin"}return t.charsAdvanced+=e.match(/^([^()]*)/)[1].length,t.tokenize(e,t)}function F(e,t){return e.match(/.*?(?=,|;|{|}|\(|\)|=|$|\s)/),e.match(/^{/)?t.nestedLevels++:e.match(/^}/)&&t.nestedLevels--,t.nestedLevels>0?e.match(/.*?(?={|})/)||e.next():0==t.nestedLevels&&(t.tokenize=k),"builtin"}function g(e,t){return e.match(/^#=/)&&t.nestedLevels++,e.match(/.*?(?=(#=|=#))/)||e.skipToEnd(),e.match(/^=#/)&&(t.nestedLevels--,0==t.nestedLevels&&(t.tokenize=k)),"comment"}function x(e,t){var n,r=!1;if(e.match(o))r=!0;else if(n=e.match(/\\u([a-f0-9]{1,4})(?=')/i)){((i=parseInt(n[1],16))<=55295||i>=57344)&&(r=!0,e.next())}else if(n=e.match(/\\U([A-Fa-f0-9]{5,8})(?=')/)){var i;(i=parseInt(n[1],16))<=1114111&&(r=!0,e.next())}return r?(t.leavingExpr=!0,t.tokenize=k,"string"):(e.match(/^[^']+(?=')/)||e.skipToEnd(),e.match(/^'/)&&(t.tokenize=k),"error")}return{startState:function(){return{tokenize:k,scopes:[],lastToken:null,leavingExpr:!1,isDefinition:!1,nestedLevels:0,charsAdvanced:0,firstParenPos:-1}},token:function(e,t){var n=t.tokenize(e,t),r=e.current();return r&&n&&(t.lastToken=r),n},indent:function(t,n){var r=0;return"]"!==n&&")"!==n&&"end"!==n&&"else"!==n&&"catch"!==n&&"elseif"!==n&&"finally"!==n||(r=-1),(t.scopes.length+r)*e.indentUnit},electricInput:/\b(end|else|catch|finally)\b/,blockCommentStart:"#=",blockCommentEnd:"=#",lineComment:"#",fold:"indent"}}),e.defineMIME("text/x-julia","julia")});