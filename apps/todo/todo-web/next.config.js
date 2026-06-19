import { withNx } from '@nx/next';

const nextConfig = {
  nx: {
    svgr: true,
  },
};

export default withNx(nextConfig);