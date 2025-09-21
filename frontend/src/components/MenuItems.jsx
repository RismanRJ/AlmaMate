import { Button, Menu, Portal } from "@chakra-ui/react";

const MenuItems = ({ id }) => {
  return (
    <Menu.Root positioning={{ placement: "right-start" }}>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          Update Role
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="new-txt">New Text File</Menu.Item>
            <Menu.Item value="new-file">New File...</Menu.Item>
            <Menu.Item value="new-win">New Window</Menu.Item>
            <Menu.Item value="open-file">Open File...</Menu.Item>
            <Menu.Item value="export">Export</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default MenuItems;
