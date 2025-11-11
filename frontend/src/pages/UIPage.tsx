import { useState } from 'react';
import { PlusIcon } from '@phosphor-icons/react';
import {
  Alert,
  Button,
  Card,
  Dialog,
  FileUpload,
  FormLabel,
  Input,
  Menu,
  Popover,
  RadioGroup,
  ScrollArea,
  Select,
  Switch,
  useToastManager,
} from '../ui';

export default function UIPage() {
  const [switchValue, setSwitchValue] = useState(false);
  const [selectValue, setSelectValue] = useState<string>();
  const [radioValue, setRadioValue] = useState<string>('option1');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const toastManager = useToastManager();

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(newFile);
    } else {
      setPreview(null);
    }
  };

  const handleSelectChange = (value: string | null) => {
    setSelectValue(value ?? undefined);
  };

  const showToast = (type: 'info' | 'success' | 'warning' | 'error') => {
    toastManager.add({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast notification`,
      data: { type },
    });
  };

  return (
    <div className="h-screen overflow-y-auto p-8!">
      <div className="mx-auto! flex flex-col items-start gap-4 max-w-3xl">

        <Alert variant="info">info alert</Alert>
        <Alert variant="success">success alert</Alert>
        <Alert variant="warning">warning alert</Alert>
        <Alert variant="error">error alert</Alert>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary Button</Button>
          <Button variant="default">Default Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="primary" disabled>Disabled Button</Button>
          <Button variant="primary" size="icon">
            <PlusIcon size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card shadow="sm" border padding="md">
            <h3>Small Shadow Card</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>With border and medium padding</p>
          </Card>
          <Card shadow="lg" padding="lg">
            <h3>Large Shadow Card</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>No border, large padding</p>
          </Card>
          <Card shadow="xl" border padding="md">
            <h3>Extra Large Shadow</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Dramatic shadow effect</p>
          </Card>
          <Card shadow="none" border padding="sm">
            <h3>No Shadow</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Just a bordered card</p>
          </Card>
        </div>

        <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Dialog Title"
          description="This is a description of what this dialog is about."
          footer={
            <>
              <Button variant="default" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p>
            This is the dialog content. You can put any content here including forms, text, or other components.
          </p>
        </Dialog>

        <div className="space-y-4 max-w-md">
          <div>
            <FormLabel htmlFor="input1">Text Input</FormLabel>
            <Input
              id="input1"
              type="text"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div>
            <FormLabel htmlFor="input2" required>
              Required Input
            </FormLabel>
            <Input id="input2" type="email" placeholder="email@example.com" />
          </div>
          <div>
            <FormLabel htmlFor="textarea1">Textarea</FormLabel>
            <Input
              id="textarea1"
              as="textarea"
              placeholder="Enter multiple lines..."
              rows={4}
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-md">
          <FormLabel>Choose an option</FormLabel>
          <Select
            value={selectValue}
            onChange={handleSelectChange}
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
              { value: 'option4', label: 'Option 4' },
            ]}
            placeholder="Select an option..."
          />
          {selectValue && <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Selected: {selectValue}</p>}
        </div>

        <div className="max-w-md">
          <FormLabel>Choose one option</FormLabel>
          <RadioGroup
            value={radioValue}
            onChange={setRadioValue}
            options={[
              { value: 'option1', label: 'First Option' },
              { value: 'option2', label: 'Second Option' },
              { value: 'option3', label: 'Third Option' },
            ]}
          />
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Selected: {radioValue}</p>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
          <FormLabel>Enable feature ({switchValue ? 'On' : 'Off'})</FormLabel>
        </div>

        <Menu
          trigger={<Button variant="default">Open Menu</Button>}
          items={[
            { label: 'Edit', onClick: () => alert('Edit clicked') },
            { label: 'Duplicate', onClick: () => alert('Duplicate clicked') },
            { label: 'Archive', onClick: () => alert('Archive clicked') },
            { label: 'Delete', onClick: () => alert('Delete clicked'), disabled: true },
          ]}
        />

        <Popover
          trigger={<Button variant="default">Open Popover</Button>}
          title="Popover Title"
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            This is a popover with some helpful information or actions. It can contain any content you want.
          </p>
          <Button variant="primary" size="default" className="mt-3 w-full">
            Action
          </Button>
        </Popover>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => showToast('info')}>Info Toast</Button>
          <Button onClick={() => showToast('success')}>Success Toast</Button>
          <Button onClick={() => showToast('warning')}>Warning Toast</Button>
          <Button onClick={() => showToast('error')}>Error Toast</Button>
        </div>

        <div className="max-w-md">
          <FormLabel>Upload an image</FormLabel>
          <FileUpload
            onChange={handleFileChange}
            accept="image/*"
            preview={preview}
          />
          {file && <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>File: {file.name}</p>}
        </div>

        <Card border padding="md" className="max-w-md">
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-4">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  Item {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <div className="space-y-3 max-w-md">
          <FormLabel>Regular Label</FormLabel>
          <FormLabel required>Required Label</FormLabel>
          <FormLabel htmlFor="example">Label with htmlFor</FormLabel>
        </div>
      </div>
    </div>
  );
}
