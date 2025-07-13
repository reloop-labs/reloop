import * as Button from '@reloop/ui/components/fancy-button';

export default function Home() {
  return (
    <div>
      <h1 className="title-h1">
        Welcome to Reloop UI!
        <span className="text-title-h2">A React component library</span>
      </h1>
      <Button.Root variant="neutral">Give a star</Button.Root>
    </div>
  );
}
