FROM nodesource/centos7:5.5.0

RUN yum install -y perf

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install --production


COPY . /src

EXPOSE  8080
CMD ["node", "--perf-basic-prof-only-functions", "/src/index.js"]