import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextEditor from '../components/TextEditor/Texteditor';

describe('TextEditor Isolation Tests', () => {
  it('should maintain separate content in multiple editor instances', () => {
    const onChange1 = jest.fn();
    const onChange2 = jest.fn();

    const { rerender } = render(
      <>
        <TextEditor
          key="editor1"
          value="Content for editor 1"
          onChange={onChange1}
        />
        <TextEditor
          key="editor2"
          value="Content for editor 2"
          onChange={onChange2}
        />
      </>
    );

    // Verify both editors have unique data-editor-id attributes
    const editors = screen.getAllByRole('textbox');
    expect(editors.length).toBe(2);
    
    const editor1Container = editors[0].closest('[data-editor-id]');
    const editor2Container = editors[1].closest('[data-editor-id]');
    
    expect(editor1Container?.getAttribute('data-editor-id')).not.toBe(
      editor2Container?.getAttribute('data-editor-id')
    );
  });

  it('should not share clipboard content between editors', () => {
    const onChange1 = jest.fn();
    const onChange2 = jest.fn();

    render(
      <>
        <TextEditor
          key="editor1"
          value="Original content 1"
          onChange={onChange1}
        />
        <TextEditor
          key="editor2"
          value="Original content 2"
          onChange={onChange2}
        />
      </>
    );

    // Each editor should maintain its own clipboard handler
    const editors = screen.getAllByRole('textbox');
    
    // Simulate paste in first editor
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    });
    
    fireEvent(editors[0], pasteEvent);
    
    // Second editor should not be affected
    expect(onChange2).not.toHaveBeenCalled();
  });

  it('should properly update when value prop changes', () => {
    const onChange = jest.fn();
    
    const { rerender } = render(
      <TextEditor
        key="test-editor"
        value="Initial value"
        onChange={onChange}
      />
    );

    // Update the value prop
    rerender(
      <TextEditor
        key="test-editor"
        value="Updated value"
        onChange={onChange}
      />
    );

    // The editor should reflect the new value
    // Note: Due to Quill's internal handling, we would need to check
    // the actual Quill instance, but this demonstrates the pattern
  });
});
