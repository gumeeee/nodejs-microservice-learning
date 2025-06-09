import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import { cluster } from "../cluster";
import { appLoadBalancer, networkLoadBalancer } from "../load-balancer";
import { kongDockerImage } from "../images/kong";
import { ordersHTTPListener } from "./orders";

const proxyTargetGroup = appLoadBalancer.createTargetGroup("proxy-target", {
  port: 8000,
  protocol: "HTTP",
  healthCheck: {
    path: "/orders/health",
    protocol: "HTTP",
  },
});

export const proxyHTTPListener = appLoadBalancer.createListener(
  "proxy-listener",
  {
    port: 80,
    protocol: "HTTP",
    targetGroup: proxyTargetGroup,
  }
);

const adminTargetGroup = appLoadBalancer.createTargetGroup("admin-target", {
  port: 8002,
  protocol: "HTTP",
  healthCheck: {
    path: "/orders/health",
    protocol: "HTTP",
  },
});

export const adminHTTPListener = appLoadBalancer.createListener(
  "admin-listener",
  {
    port: 8002,
    protocol: "HTTP",
    targetGroup: adminTargetGroup,
  }
);

const adminApiTargetGroup = appLoadBalancer.createTargetGroup(
  "admin-api-target",
  {
    port: 8001,
    protocol: "HTTP",
    healthCheck: {
      path: "/",
      protocol: "HTTP",
    },
  }
);

export const adminApiHTTPListener = appLoadBalancer.createListener(
  "admin-api-listener",
  {
    port: 8001,
    protocol: "HTTP",
    targetGroup: adminApiTargetGroup,
  }
);

export const kongService = new awsx.classic.ecs.FargateService("fargate-kong", {
  cluster,
  desiredCount: 1,
  taskDefinitionArgs: {
    container: {
      image: kongDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [
        proxyHTTPListener,
        adminHTTPListener,
        adminApiHTTPListener,
      ],
      environment: [
        { name: "KONG_DATABASE", value: "off" },
        { name: "KONG_ADMIN_LISTEN", value: "0.0.0.0:8001" },
        {
          name: "ORDERS_SERVICE_URL",
          value: pulumi.interpolate`http://${ordersHTTPListener.endpoint.hostname}:${ordersHTTPListener.endpoint.port}`,
        },
      ],
    },
  },
});
