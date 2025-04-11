import React from 'react';
import { Editor } from '@tiptap/react';
import {
  HStack,
  IconButton,
  Tooltip,
  Divider,
  Select,
  ButtonGroup,
} from '@chakra-ui/react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiLink,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiImage,
  FiFileText,
  FiCode,
  FiType,
  FiTable,
} from 'react-icons/fi';

interface EditorToolbarProps {
  editor: Editor | null;
  onCiteClick: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onCiteClick,
}) => {
  if (!editor) {
    return null;
  }

  const headingOptions = [
    { value: '0', label: 'Paragraph' },
    { value: '1', label: 'Heading 1' },
    { value: '2', label: 'Heading 2' },
    { value: '3', label: 'Heading 3' },
    { value: '4', label: 'Heading 4' },
  ];

  const setHeading = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const level = parseInt(event.target.value, 10);
    
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const getCurrentHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return '1';
    if (editor.isActive('heading', { level: 2 })) return '2';
    if (editor.isActive('heading', { level: 3 })) return '3';
    if (editor.isActive('heading', { level: 4 })) return '4';
    return '0';
  };

  const addLink = () => {
    const url = window.prompt('URL');
    
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Image URL');
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <HStack
      spacing={2}
      p={2}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      overflowX="auto"
      w="full"
    >
      <Select
        size="sm"
        w="150px"
        value={getCurrentHeadingValue()}
        onChange={setHeading}
      >
        {headingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Divider orientation="vertical" h="24px" />

      <ButtonGroup size="sm" isAttached variant="outline">
        <Tooltip label="Bold">
          <IconButton
            aria-label="Bold"
            icon={<FiBold />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            colorScheme={editor.isActive('bold') ? 'blue' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Italic">
          <IconButton
            aria-label="Italic"
            icon={<FiItalic />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            colorScheme={editor.isActive('italic') ? 'blue' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Underline">
          <IconButton
            aria-label="Underline"
            icon={<FiUnderline />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            colorScheme={editor.isActive('underline') ? 'blue' : 'gray'}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h="24px" />

      <ButtonGroup size="sm" isAttached variant="outline">
        <Tooltip label="Bullet List">
          <IconButton
            aria-label="Bullet List"
            icon={<FiList />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            colorScheme={editor.isActive('bulletList') ? 'blue' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Numbered List">
          <IconButton
            aria-label="Numbered List"
            icon={<FiList />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            colorScheme={editor.isActive('orderedList') ? 'blue' : 'gray'}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h="24px" />

      <ButtonGroup size="sm" isAttached variant="outline">
        <Tooltip label="Align Left">
          <IconButton
            aria-label="Align Left"
            icon={<FiAlignLeft />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            colorScheme={editor.isActive({ textAlign: 'left' }) ? 'blue' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Align Center">
          <IconButton
            aria-label="Align Center"
            icon={<FiAlignCenter />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            colorScheme={editor.isActive({ textAlign: 'center' }) ? 'blue' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Align Right">
          <IconButton
            aria-label="Align Right"
            icon={<FiAlignRight />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            colorScheme={editor.isActive({ textAlign: 'right' }) ? 'blue' : 'gray'}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h="24px" />

      <ButtonGroup size="sm" isAttached variant="outline">
        <Tooltip label="Link">
          <IconButton
            aria-label="Link"
            icon={<FiLink />}
            onClick={addLink}
            isActive={editor.isActive('link')}
            colorScheme={editor.isActive('link') ? 'blue' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Image">
          <IconButton
            aria-label="Image"
            icon={<FiImage />}
            onClick={addImage}
          />
        </Tooltip>
        <Tooltip label="Table">
          <IconButton
            aria-label="Table"
            icon={<FiTable />}
            onClick={addTable}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h="24px" />

      <Tooltip label="Add Citation">
        <IconButton
          aria-label="Add Citation"
          icon={<FiFileText />}
          onClick={onCiteClick}
          colorScheme="teal"
          variant="outline"
          size="sm"
        />
      </Tooltip>

      <Tooltip label="Code Block">
        <IconButton
          aria-label="Code Block"
          icon={<FiCode />}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          colorScheme={editor.isActive('codeBlock') ? 'blue' : 'gray'}
          variant="outline"
          size="sm"
        />
      </Tooltip>
    </HStack>
  );
};
