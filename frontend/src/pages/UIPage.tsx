import { useState } from 'react';
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
  const { createToast } = useToastManager();

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

  const showToast = (type: 'info' | 'success' | 'warning' | 'error') => {
    createToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast notification`,
      data: { type },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">UI Components Showcase</h1>

        {/* Alert */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Alert</h2>
          <div className="space-y-3">
            <Alert variant="info">This is an info alert</Alert>
            <Alert variant="success">This is a success alert</Alert>
            <Alert variant="warning">This is a warning alert</Alert>
            <Alert variant="error">This is an error alert</Alert>
          </div>
        </section>

        {/* Button */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="default">Default Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>Disabled Button</Button>
            <Button variant="primary" size="icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </div>
        </section>

        {/* Card */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card shadow="sm" border padding="md">
              <h3 className="font-semibold mb-2">Small Shadow Card</h3>
              <p className="text-gray-600">With border and medium padding</p>
            </Card>
            <Card shadow="lg" padding="lg">
              <h3 className="font-semibold mb-2">Large Shadow Card</h3>
              <p className="text-gray-600">No border, large padding</p>
            </Card>
            <Card shadow="xl" border padding="md">
              <h3 className="font-semibold mb-2">Extra Large Shadow</h3>
              <p className="text-gray-600">Dramatic shadow effect</p>
            </Card>
            <Card shadow="none" border padding="sm">
              <h3 className="font-semibold mb-2">No Shadow</h3>
              <p className="text-gray-600">Just a bordered card</p>
            </Card>
          </div>
        </section>

        {/* Dialog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dialog</h2>
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
            <p className="text-gray-700">
              This is the dialog content. You can put any content here including forms, text, or other components.
            </p>
          </Dialog>
        </section>

        {/* Input */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Input</h2>
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
        </section>

        {/* Select */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select</h2>
          <div className="max-w-md">
            <FormLabel>Choose an option</FormLabel>
            <Select
              value={selectValue}
              onChange={setSelectValue}
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
                { value: 'option4', label: 'Option 4' },
              ]}
              placeholder="Select an option..."
            />
            {selectValue && <p className="mt-2 text-sm text-gray-600">Selected: {selectValue}</p>}
          </div>
        </section>

        {/* Radio Group */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Radio Group</h2>
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
            <p className="mt-2 text-sm text-gray-600">Selected: {radioValue}</p>
          </div>
        </section>

        {/* Switch */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Switch</h2>
          <div className="flex items-center gap-3">
            <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
            <FormLabel>Enable feature ({switchValue ? 'On' : 'Off'})</FormLabel>
          </div>
        </section>

        {/* Menu */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Menu</h2>
          <Menu
            trigger={<Button variant="default">Open Menu</Button>}
            items={[
              { label: 'Edit', onClick: () => alert('Edit clicked') },
              { label: 'Duplicate', onClick: () => alert('Duplicate clicked') },
              { label: 'Archive', onClick: () => alert('Archive clicked') },
              { label: 'Delete', onClick: () => alert('Delete clicked'), disabled: true },
            ]}
          />
        </section>

        {/* Popover */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Popover</h2>
          <Popover
            trigger={<Button variant="default">Open Popover</Button>}
            title="Popover Title"
          >
            <p className="text-sm text-gray-700">
              This is a popover with some helpful information or actions. It can contain any content you want.
            </p>
            <Button variant="primary" size="default" className="mt-3 w-full">
              Action
            </Button>
          </Popover>
        </section>

        {/* Toast */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Toast</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => showToast('info')}>Info Toast</Button>
            <Button onClick={() => showToast('success')}>Success Toast</Button>
            <Button onClick={() => showToast('warning')}>Warning Toast</Button>
            <Button onClick={() => showToast('error')}>Error Toast</Button>
          </div>
        </section>

        {/* FileUpload */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">File Upload</h2>
          <div className="max-w-md">
            <FormLabel>Upload an image</FormLabel>
            <FileUpload
              onChange={handleFileChange}
              accept="image/*"
              preview={preview}
            />
            {file && <p className="mt-2 text-sm text-gray-600">File: {file.name}</p>}
          </div>
        </section>

        {/* ScrollArea */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Scroll Area</h2>
          <Card border padding="md" className="max-w-md">
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded">
                    Item {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </section>

        {/* FormLabel */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Form Label</h2>
          <div className="space-y-3 max-w-md">
            <FormLabel>Regular Label</FormLabel>
            <FormLabel required>Required Label</FormLabel>
            <FormLabel htmlFor="example">Label with htmlFor</FormLabel>
          </div>
        </section>
      </div>
    </div>
  );
}
