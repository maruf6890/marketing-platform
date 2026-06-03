"use client"

import MultiSelect from '@/components/app_inputs/multi_select_inputl';
import SingleSelect from '@/components/app_inputs/single_select_input';
import SwitchInput from '@/components/app_inputs/switch_input';
import TextInput from '@/components/app_inputs/text_input'
import { DefaultButton } from '@/components/app_ui_element/DefaultButton';
import AppDialog from '@/components/app_ui_element/DeleteDialog';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'

export default function ComponentPreview() {
  const [isPublic, setIsPublic] = React.useState(false);
  const [selectedFruit, setSelectedFruit] = React.useState("");
  const [selectedFruits, setSelectedFruits] = React.useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleSubmit = () => {
    console.log("Confirmed!");
    setOpen(false);
  };
   const handleLogin = () => {
     window.location.href = "http://localhost:5000/user/facebook";
   };


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Component Preview</h1>
      <TextInput
        id="dummy-input"
        required={true}
        label="Full Name"
        type="number"
        textArea={false}
        value={"text"}
        onChange={(value) => {
          console.log(value);
        }}
        helperText="Stay safe"
      />
      <SwitchInput
        id="isPublic"
        label="Make profile public"
        checked={isPublic}
        onChange={setIsPublic}
        helperText="Your profile will be visible to others"
      />

      <SingleSelect
        id="fruit"
        description="Test desription"
        label="Choose a fruit"
        value={selectedFruit}
        onChange={setSelectedFruit}
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
          { label: "Cherry", value: "cherry" },
        ]}
        helperText="Pick one fruit only"
      />

      <MultiSelect
        id="fruits"
        label="Select Fruits"
        value={selectedFruits}
        onChange={setSelectedFruits}
        options={[
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
          { label: "Cherry", value: "cherry" },
          { label: "Mango", value: "mango" },
        ]}
        description="You can select multiple fruits"
        helperText="Selected fruits will be highlighted"
      />

      <DefaultButton variant="outline" size="default">
        Click Me
      </DefaultButton>
      <Button onClick={handleLogin} variant="outline" size="default">
        Login with Facebook
      </Button>
      <AppDialog
        open={open}
        onOpenChange={setOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
