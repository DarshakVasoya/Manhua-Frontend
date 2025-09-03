export default function Head() {
  return (
    <>
  <title>404 - Page Not Found | {process.env.NEXT_PUBLIC_SITE_NAME}</title>
  <meta name="description" content={`404 - Page Not Found. The page you are looking for does not exist on ${process.env.NEXT_PUBLIC_SITE_NAME}.`} />
      <meta name="robots" content="noindex" />
    </>
  );
}
