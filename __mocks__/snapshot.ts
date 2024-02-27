export default {
    resolveSnapshotPath: (testPath: string, snapshotExtension: string) => testPath + snapshotExtension,
    resolveTestPath: (snapshotFilePath: string, snapshotExtension: string) => snapshotFilePath.replace(snapshotExtension, ""),
    testPathForConsistencyCheck: "some/test/case.spec.ts",
};
