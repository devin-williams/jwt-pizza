export async function openWithState(page, path, state) {
  // Go somewhere trivial so we can replace the current entry.
  await page.goto("/");
  await page.evaluate(
    ([p, s]) => {
      history.replaceState(s, "", p);
    },
    [path, state]
  );
  // Reload so React Router reads location.state on first render of that path.
  await page.reload();
}
