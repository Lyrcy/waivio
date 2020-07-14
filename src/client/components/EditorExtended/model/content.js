import {
  EditorState,
  convertFromRaw,
  CompositeDecorator,
  ContentState,
  SelectionState,
} from 'draft-js';

import Link, { findLinkEntities } from '../components/entities/link';
import ObjectLink, { findObjEntities } from '../components/entities/objectlink';

const defaultDecorators = new CompositeDecorator([
  {
    strategy: findObjEntities,
    component: ObjectLink,
  },
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

const createEditorState = (content = null, decorators = defaultDecorators) => {
  let initialEditorState = {};
  if (content === null) {
    initialEditorState = EditorState.createEmpty(decorators);
  }
  let contentState = null;
  if (typeof content === 'string') {
    contentState = ContentState.createFromText(content);
  } else {
    contentState = convertFromRaw(content);
  }
  initialEditorState = EditorState.createWithContent(contentState, decorators);
  return initialEditorState;
};

export default createEditorState;

export const moveSelectionToEnd = editorState => {
  const content = editorState.getCurrentContent();
  const blockMap = content.getBlockMap();
  const key = blockMap.last().getKey();
  const length = blockMap.last().getLength();
  const selection = new SelectionState({
    anchorKey: key,
    anchorOffset: length,
    focusKey: key,
    focusOffset: length,
  });
  return EditorState.acceptSelection(editorState, selection);
};
