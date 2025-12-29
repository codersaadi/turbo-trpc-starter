"use client";
import {
  BetterCard,
  BetterCardContent,
  BetterCardDescription,
  BetterCardFooter,
  BetterCardHeader,
  BetterCardTitle,
} from "@repo/ui/components/new-ui/better-card";
import {
  PremiumPopover,
  PremiumPopoverContent,
  PremiumPopoverTrigger,
} from "@repo/ui/components/new-ui/premium-popover";
import {
  PremiumSelect,
  PremiumSelectContent,
  PremiumSelectGroup,
  PremiumSelectItem,
  PremiumSelectLabel,
  PremiumSelectTrigger,
  PremiumSelectValue,
} from "@repo/ui/components/new-ui/premium-select";
import {
  ModernDrawer,
  ModernDrawerClose,
  ModernDrawerContent,
  ModernDrawerDescription,
  ModernDrawerFooter,
  ModernDrawerHeader,
  ModernDrawerTitle,
  ModernDrawerTrigger,
} from "@repo/ui/components/new-ui/modern-drawer";
import {
  TypographyH1,
  TypographyLead,
  TypographyP,
  TypographyBlockquote,
  TypographyTable,
  TypographyList,
  TypographyInlineCode,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
} from "@repo/ui/components/new-ui/typography";
import { Button } from "@repo/ui/components/ui/button";
import { useThemeSwitch } from "@repo/ui/hooks/use-theme-switch";

export default function NewUiDemoPage() {
  const { theme, getThemeIconButton, setTheme, resolvedTheme } =
    useThemeSwitch();
  return (
    <div className="container mx-auto py-10 space-y-10 min-h-screen bg-background text-foreground">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">New UI Components</h1>
        <p className="text-muted-foreground">
          Showcasing the premium components with dark/light mode support.
        </p>
      </div>
      <Button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {getThemeIconButton()}
        {theme}
      </Button>
      <section className="space-y-6 pb-20">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-8 rounded-lg border p-6">
          <div className="space-y-2">
            <TypographyH1>
              Taxing Laughter: The Joke Tax Chronicles
            </TypographyH1>
            <TypographyLead>
              A modal dialog that interrupts the user with important content and
              expects a response.
            </TypographyLead>
          </div>

          <div className="space-y-4">
            <TypographyH2>The People of the Kingdom</TypographyH2>
            <TypographyP>
              The king, seeing how much happier his subjects were, realized the
              error of his ways and repealed the joke tax.
            </TypographyP>
            <TypographyBlockquote>
              "After all," he said, "everyone enjoys a good joke, so it's only
              fair that they should pay for the privilege."
            </TypographyBlockquote>
          </div>

          <div className="space-y-4">
            <TypographyH3>The Joke Tax</TypographyH3>
            <TypographyP>
              The king's subjects were not amused. They grumbled and complained,
              but the king was firm:
            </TypographyP>
            <TypographyList>
              <li>1st level of puns: 5 gold coins</li>
              <li>2nd level of jokes: 10 gold coins</li>
              <li>3rd level of one-liners : 20 gold coins</li>
            </TypographyList>
          </div>

          <div className="space-y-4">
            <TypographyH4>People stopped telling jokes</TypographyH4>
            <TypographyP>
              As a result, people stopped telling jokes, and the kingdom became
              a gloomy place.
            </TypographyP>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <TypographyLarge>Large Text</TypographyLarge>
              <TypographySmall>Small Text</TypographySmall>
              <TypographyMuted>Muted Text</TypographyMuted>
            </div>
            <div>
              <TypographyP>
                Press <TypographyInlineCode>⌘J</TypographyInlineCode> to tell a
                dad joke.
              </TypographyP>
            </div>
          </div>

          <div>
            <TypographyTable>
              <thead>
                <tr className="m-0 border-t p-0 even:bg-muted">
                  <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                    King's Treasury
                  </th>
                  <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                    People's Happiness
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="m-0 border-t p-0 even:bg-muted">
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    Empty
                  </td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    Overflowing
                  </td>
                </tr>
                <tr className="m-0 border-t p-0 even:bg-muted">
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    Modest
                  </td>
                  <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    Satisfied
                  </td>
                </tr>
              </tbody>
            </TypographyTable>
          </div>
        </div>
      </section>

      <div className="pb-20">
        <h2 className="mb-6 text-2xl font-semibold">Other Components</h2>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Better Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BetterCard>
            <BetterCardHeader>
              <BetterCardTitle>Default Card</BetterCardTitle>
              <BetterCardDescription>Standard variant</BetterCardDescription>
            </BetterCardHeader>
            <BetterCardContent>
              <p>This is a standard card with hover effects.</p>
            </BetterCardContent>
            <BetterCardFooter>
              <Button>Action</Button>
            </BetterCardFooter>
          </BetterCard>

          <BetterCard subtleGradient>
            <BetterCardHeader>
              <BetterCardTitle>Subtle Gradient</BetterCardTitle>
              <BetterCardDescription>
                Default with subtle touch
              </BetterCardDescription>
            </BetterCardHeader>
            <BetterCardContent>
              <p>This card has a very subtle gradient for depth.</p>
            </BetterCardContent>
            <BetterCardFooter>
              <Button variant="secondary">Action</Button>
            </BetterCardFooter>
          </BetterCard>

          <BetterCard variant="glass">
            <BetterCardHeader>
              <BetterCardTitle>Glass Card</BetterCardTitle>
              <BetterCardDescription>
                Glassmorphism variant
              </BetterCardDescription>
            </BetterCardHeader>
            <BetterCardContent>
              <p>This card has a glass effect and backdrop blur.</p>
            </BetterCardContent>
            <BetterCardFooter>
              <Button variant="secondary">Action</Button>
            </BetterCardFooter>
          </BetterCard>

          <BetterCard variant="gradient">
            <BetterCardHeader>
              <BetterCardTitle>Gradient Card</BetterCardTitle>
              <BetterCardDescription>Gradient variant</BetterCardDescription>
            </BetterCardHeader>
            <BetterCardContent>
              <p>This card features a subtle gradient background.</p>
            </BetterCardContent>
            <BetterCardFooter>
              <Button variant="outline">Action</Button>
            </BetterCardFooter>
          </BetterCard>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Premium Popover</h2>
        <div className="flex gap-4">
          <PremiumPopover>
            <PremiumPopoverTrigger asChild>
              <Button>Open Popover</Button>
            </PremiumPopoverTrigger>
            <PremiumPopoverContent>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
            </PremiumPopoverContent>
          </PremiumPopover>
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Premium Select</h2>
        <div className="flex gap-4 w-50">
          <PremiumSelect>
            <PremiumSelectTrigger>
              <PremiumSelectValue placeholder="Select a fruit" />
            </PremiumSelectTrigger>
            <PremiumSelectContent>
              <PremiumSelectGroup>
                <PremiumSelectLabel>Fruits</PremiumSelectLabel>
                <PremiumSelectItem value="apple">Apple</PremiumSelectItem>
                <PremiumSelectItem value="banana">Banana</PremiumSelectItem>
                <PremiumSelectItem value="blueberry">
                  Blueberry
                </PremiumSelectItem>
                <PremiumSelectItem value="grapes">Grapes</PremiumSelectItem>
                <PremiumSelectItem value="pineapple">
                  Pineapple
                </PremiumSelectItem>
              </PremiumSelectGroup>
            </PremiumSelectContent>
          </PremiumSelect>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Modern Drawer</h2>
        <div className="flex gap-4">
          <ModernDrawer>
            <ModernDrawerTrigger asChild>
              <Button variant="outline">Open Drawer</Button>
            </ModernDrawerTrigger>
            <ModernDrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <ModernDrawerHeader>
                  <ModernDrawerTitle>Move Goal</ModernDrawerTitle>
                  <ModernDrawerDescription>
                    Set your daily activity goal.
                  </ModernDrawerDescription>
                </ModernDrawerHeader>
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-5xl font-bold tracking-tighter">
                      400
                    </span>
                    <span className="text-muted-foreground uppercase tracking-widest text-[0.70em]">
                      Calories/day
                    </span>
                  </div>
                  <div className="mt-3 h-30 bg-muted/50 rounded-xl" />
                </div>
                <ModernDrawerFooter>
                  <Button>Submit</Button>
                  <ModernDrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </ModernDrawerClose>
                </ModernDrawerFooter>
              </div>
            </ModernDrawerContent>
          </ModernDrawer>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Enhanced Sidebar</h2>
        <div className="h-100 border border-border/50 rounded-xl overflow-hidden relative flex">
          <EnhancedSidebarDemo />
          <div className="flex-1 p-6 bg-muted/20">
            <h3 className="text-lg font-medium">Main Content</h3>
            <p className="text-muted-foreground">
              The sidebar is fully collapsible and animated.
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Polar Sidebar</h2>
        <div className="h-150 w-75 border border-border/50 rounded-xl overflow-hidden relative flex bg-card">
          <PolarSidebarDemo />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Premium Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Default</h4>
            <PremiumInput placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Minimal</h4>
            <PremiumInput variant="minimal" placeholder="Type something..." />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Floating Label</h4>
            <PremiumInput
              variant="floating"
              label="Email Address"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Glow Effect</h4>
            <PremiumInput variant="glow" placeholder="Focus me..." />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Animated Tabs</h2>
        <div className="space-y-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Segmented (Default)</h4>
            <AnimatedTabs defaultValue="music" className="w-100">
              <AnimatedTabsList className="grid w-full grid-cols-2">
                <AnimatedTabsTrigger value="music">Music</AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="podcast">
                  Podcast
                </AnimatedTabsTrigger>
              </AnimatedTabsList>
              <AnimatedTabsContent value="music">
                <BetterCard className="p-4">
                  <p>Music content goes here.</p>
                </BetterCard>
              </AnimatedTabsContent>
              <AnimatedTabsContent value="podcast">
                <BetterCard className="p-4">
                  <p>Podcast content goes here.</p>
                </BetterCard>
              </AnimatedTabsContent>
            </AnimatedTabs>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Underline</h4>
            <AnimatedTabs defaultValue="account" className="w-100">
              <AnimatedTabsList className="bg-transparent justify-start p-0">
                <AnimatedTabsTrigger variant="underline" value="account">
                  Account
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger variant="underline" value="password">
                  Password
                </AnimatedTabsTrigger>
              </AnimatedTabsList>
            </AnimatedTabs>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Premium Modal</h2>
        <PremiumModal>
          <PremiumModalTrigger asChild>
            <Button variant="outline">Open Modal</Button>
          </PremiumModalTrigger>
          <PremiumModalContent>
            <PremiumModalHeader>
              <PremiumModalTitle>Edit Profile</PremiumModalTitle>
              <PremiumModalDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </PremiumModalDescription>
            </PremiumModalHeader>
            <div className="grid gap-4 py-4">
              <PremiumInput
                label="Name"
                defaultValue="Pedro Duarte"
                variant="floating"
              />
              <PremiumInput
                label="Username"
                defaultValue="@peduarte"
                variant="floating"
              />
            </div>
            <PremiumModalFooter>
              <Button type="submit">Save changes</Button>
            </PremiumModalFooter>
          </PremiumModalContent>
        </PremiumModal>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Modern Accordion</h2>
        <ModernAccordion type="single" collapsible className="w-100">
          <ModernAccordionItem value="item-1">
            <ModernAccordionTrigger>Is it accessible?</ModernAccordionTrigger>
            <ModernAccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </ModernAccordionContent>
          </ModernAccordionItem>
          <ModernAccordionItem value="item-2">
            <ModernAccordionTrigger>Is it styled?</ModernAccordionTrigger>
            <ModernAccordionContent>
              Yes. It comes with default styles that matches the other
              components&apos; aesthetic.
            </ModernAccordionContent>
          </ModernAccordionItem>
          <ModernAccordionItem value="item-3">
            <ModernAccordionTrigger>Is it animated?</ModernAccordionTrigger>
            <ModernAccordionContent>
              Yes. It includes proper height animations by default.
            </ModernAccordionContent>
          </ModernAccordionItem>
        </ModernAccordion>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Status Badges</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge variant="neutral" styleType="solid">
            Neutral
          </StatusBadge>
          <StatusBadge variant="success" styleType="solid">
            Success
          </StatusBadge>
          <StatusBadge variant="warning" styleType="solid">
            Warning
          </StatusBadge>
          <StatusBadge variant="error" styleType="solid">
            Error
          </StatusBadge>
          <StatusBadge variant="info" styleType="solid">
            Info
          </StatusBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge variant="neutral" styleType="soft">
            Neutral
          </StatusBadge>
          <StatusBadge variant="success" styleType="soft">
            Success
          </StatusBadge>
          <StatusBadge variant="warning" styleType="soft">
            Warning
          </StatusBadge>
          <StatusBadge variant="error" styleType="soft">
            Error
          </StatusBadge>
          <StatusBadge variant="info" styleType="soft">
            Info
          </StatusBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge variant="neutral" styleType="dot">
            Neutral
          </StatusBadge>
          <StatusBadge variant="success" styleType="dot">
            Success
          </StatusBadge>
          <StatusBadge variant="warning" styleType="dot">
            Warning
          </StatusBadge>
          <StatusBadge variant="error" styleType="dot">
            Error
          </StatusBadge>
          <StatusBadge variant="info" styleType="dot">
            Info
          </StatusBadge>
        </div>
      </section>

      <section className="space-y-6 pb-20">
        <h2 className="text-2xl font-semibold">Premium Switch</h2>
        <div className="flex items-center space-x-2">
          <PremiumSwitch id="airplane-mode" />
          <label
            htmlFor="airplane-mode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Airplane Mode
          </label>
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Pro Table</h2>
        <div className="rounded-md border">
          <ProTable>
            <ProTableHeader>
              <ProTableRow>
                <ProTableHead className="w-25">Invoice</ProTableHead>
                <ProTableHead>Status</ProTableHead>
                <ProTableHead>Method</ProTableHead>
                <ProTableHead className="text-right">Amount</ProTableHead>
                <ProTableHead className="w-12.5"></ProTableHead>
              </ProTableRow>
            </ProTableHeader>
            <ProTableBody>
              <ProTableRow clickable>
                <ProTableCell className="font-medium">INV001</ProTableCell>
                <ProTableCell>
                  <StatusBadge variant="success" styleType="dot">
                    Paid
                  </StatusBadge>
                </ProTableCell>
                <ProTableCell>Credit Card</ProTableCell>
                <ProTableCell className="text-right">$250.00</ProTableCell>
                <ProTableCell>
                  <ProTableAction>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </ProTableAction>
                </ProTableCell>
              </ProTableRow>
              <ProTableRow clickable>
                <ProTableCell className="font-medium">INV002</ProTableCell>
                <ProTableCell>
                  <StatusBadge variant="warning" styleType="dot">
                    Pending
                  </StatusBadge>
                </ProTableCell>
                <ProTableCell>PayPal</ProTableCell>
                <ProTableCell className="text-right">$150.00</ProTableCell>
                <ProTableCell>
                  <ProTableAction>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </ProTableAction>
                </ProTableCell>
              </ProTableRow>
            </ProTableBody>
          </ProTable>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Premium Context Menu</h2>
        <PremiumContextMenu>
          <PremiumContextMenuTrigger className="flex h-37.5 w-full items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </PremiumContextMenuTrigger>
          <PremiumContextMenuContent className="w-64">
            <PremiumContextMenuItem>Back</PremiumContextMenuItem>
            <PremiumContextMenuItem disabled>Forward</PremiumContextMenuItem>
            <PremiumContextMenuItem>Reload</PremiumContextMenuItem>
            <PremiumContextMenuSeparator />
            <PremiumContextMenuItem>
              Save As...{" "}
              <PremiumContextMenuShortcut>⌘S</PremiumContextMenuShortcut>
            </PremiumContextMenuItem>
            <PremiumContextMenuItem>
              Print...{" "}
              <PremiumContextMenuShortcut>⌘P</PremiumContextMenuShortcut>
            </PremiumContextMenuItem>
          </PremiumContextMenuContent>
        </PremiumContextMenu>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">State Placeholders</h2>
        <StatePlaceholder
          icon={Inbox}
          title="No messages yet"
          description="When you receive new messages, they will appear here."
          action={<Button>Check again</Button>}
        />
      </section>

      <section className="space-y-6 pb-20">
        <h2 className="text-2xl font-semibold">Premium Sheet</h2>
        <div className="flex gap-4">
          <PremiumSheet>
            <PremiumSheetTrigger asChild>
              <Button variant="outline">Open Default Sheet</Button>
            </PremiumSheetTrigger>
            <PremiumSheetContent>
              <PremiumSheetHeader>
                <PremiumSheetTitle>Default Sheet</PremiumSheetTitle>
                <PremiumSheetDescription>
                  This is the default style, clean and consistent.
                </PremiumSheetDescription>
              </PremiumSheetHeader>
              <div className="grid gap-4 py-4">
                <PremiumInput label="Name" variant="minimal" />
                <PremiumInput label="Email" variant="minimal" />
              </div>
            </PremiumSheetContent>
          </PremiumSheet>

          <PremiumSheet>
            <PremiumSheetTrigger asChild>
              <Button variant="outline">Open Gradient Sheet</Button>
            </PremiumSheetTrigger>
            <PremiumSheetContent visual="gradient">
              <PremiumSheetHeader>
                <PremiumSheetTitle>Gradient Sheet</PremiumSheetTitle>
                <PremiumSheetDescription>
                  Subtle gradient background for a touch of class.
                </PremiumSheetDescription>
              </PremiumSheetHeader>
              <div className="grid gap-4 py-4">
                <div className="h-32 rounded-md bg-muted/20 border border-dashed flex items-center justify-center">
                  Content Area
                </div>
              </div>
            </PremiumSheetContent>
          </PremiumSheet>

          <PremiumSheet>
            <PremiumSheetTrigger asChild>
              <Button variant="outline">Open Glass Sheet</Button>
            </PremiumSheetTrigger>
            <PremiumSheetContent visual="glass">
              <PremiumSheetHeader>
                <PremiumSheetTitle>Glass Sheet</PremiumSheetTitle>
                <PremiumSheetDescription>
                  High-performance backdrop blur and translucency.
                </PremiumSheetDescription>
              </PremiumSheetHeader>
              <div className="grid gap-4 py-4">
                <StatePlaceholder
                  variant="compact"
                  icon={Layout}
                  title="Glass Effect"
                  description="See the content behind blur."
                />
              </div>
            </PremiumSheetContent>
          </PremiumSheet>
        </div>
      </section>

      <section className="space-y-6 pb-20">
        <h2 className="text-2xl font-semibold">Skeletons</h2>
        <div className="flex gap-8">
          <SkeletonCard />
          <SkeletonList count={2} />
        </div>
      </section>
    </div>
  );
}

import {
  EnhancedSidebar,
  EnhancedSidebarContent,
  EnhancedSidebarFooter,
  EnhancedSidebarHeader,
  EnhancedSidebarItem,
} from "@repo/ui/components/new-ui/enhanced-sidebar";
import {
  PolarSidebar,
  PolarSidebarContent,
  PolarSidebarFooter,
  PolarSidebarGroup,
  PolarSidebarHeader,
  PolarSidebarItem,
  PolarSearchInput,
  PolarSidebarSubItem,
} from "@repo/ui/components/new-ui/polar-sidebar";
import { PremiumInput } from "@repo/ui/components/new-ui/premium-input";
import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from "@repo/ui/components/new-ui/animated-tabs";
import {
  PremiumModal,
  PremiumModalContent,
  PremiumModalDescription,
  PremiumModalFooter,
  PremiumModalHeader,
  PremiumModalTitle,
  PremiumModalTrigger,
} from "@repo/ui/components/new-ui/premium-modal";
import {
  ModernAccordion,
  ModernAccordionContent,
  ModernAccordionItem,
  ModernAccordionTrigger,
} from "@repo/ui/components/new-ui/modern-accordion";
import { StatusBadge } from "@repo/ui/components/new-ui/status-badge";
import { PremiumSwitch } from "@repo/ui/components/new-ui/premium-switch";
import {
  ProTable,
  ProTableBody,
  ProTableCell,
  ProTableHead,
  ProTableHeader,
  ProTableRow,
  ProTableAction,
} from "@repo/ui/components/new-ui/pro-table";
import {
  PremiumContextMenu,
  PremiumContextMenuContent,
  PremiumContextMenuItem,
  PremiumContextMenuTrigger,
  PremiumContextMenuSeparator,
  PremiumContextMenuShortcut,
} from "@repo/ui/components/new-ui/premium-context-menu";
import { StatePlaceholder } from "@repo/ui/components/new-ui/state-placeholder";
import {
  SkeletonCard,
  SkeletonList,
} from "@repo/ui/components/new-ui/skeleton-group";
import {
  PremiumSheet,
  PremiumSheetContent,
  PremiumSheetDescription,
  PremiumSheetHeader,
  PremiumSheetTitle,
  PremiumSheetTrigger,
} from "@repo/ui/components/new-ui/premium-sheet";
import {
  Home,
  Settings,
  Users,
  BarChart3,
  HelpCircle,
  FileText,
  MoreVertical,
  Inbox,
  Layout,
} from "lucide-react";

function EnhancedSidebarDemo() {
  return (
    <EnhancedSidebar className="h-full border-r-0">
      <EnhancedSidebarHeader>
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="hidden group-data-[collapsed=true]:hidden md:block">
            Acme Inc
          </span>
        </div>
      </EnhancedSidebarHeader>
      <EnhancedSidebarContent>
        <div className="space-y-1">
          <EnhancedSidebarItem icon={Home} active>
            Dashboard
          </EnhancedSidebarItem>
          <EnhancedSidebarItem icon={Users}>Team</EnhancedSidebarItem>
          <EnhancedSidebarItem icon={BarChart3}>Analytics</EnhancedSidebarItem>
          <EnhancedSidebarItem icon={Settings}>Settings</EnhancedSidebarItem>
        </div>
      </EnhancedSidebarContent>
      <EnhancedSidebarFooter>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
      </EnhancedSidebarFooter>
    </EnhancedSidebar>
  );
}

function PolarSidebarDemo() {
  return (
    <PolarSidebar className="h-full border-r-0 w-full" defaultOpen={true}>
      <PolarSidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
            P
          </div>
          <span className="font-bold">Polar Style</span>
        </div>
        <PolarSearchInput />
      </PolarSidebarHeader>
      <PolarSidebarContent>
        <PolarSidebarGroup label="Menu">
          <PolarSidebarItem icon={Home} active>
            Home
          </PolarSidebarItem>
          <PolarSidebarItem icon={BarChart3}>Analytics</PolarSidebarItem>
          <PolarSidebarItem icon={Users} notifications={3}>
            Customers
          </PolarSidebarItem>
        </PolarSidebarGroup>
        <PolarSidebarGroup label="Products">
          <PolarSidebarItem icon={FileText} className="mb-1">
            Catalogue
          </PolarSidebarItem>
          <div className="ml-4 pl-2 border-l border-border/40 space-y-0.5">
            <PolarSidebarSubItem active>Overview</PolarSidebarSubItem>
            <PolarSidebarSubItem>Details</PolarSidebarSubItem>
            <PolarSidebarSubItem>Settings</PolarSidebarSubItem>
          </div>
        </PolarSidebarGroup>
      </PolarSidebarContent>
      <PolarSidebarFooter>
        <PolarSidebarItem icon={HelpCircle}>Support</PolarSidebarItem>
        <PolarSidebarItem icon={FileText}>Documentation</PolarSidebarItem>
        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex flex-col text-xs">
            <span className="font-medium">Saadi</span>
            <span className="text-muted-foreground">Pro Plan</span>
          </div>
        </div>
      </PolarSidebarFooter>
    </PolarSidebar>
  );
}
