function Bottles() {
  const [bottles, setBottles] = React.useState();
  const [isLoading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch("https://app.tea.xyz/api/bottles").then(res => res.json()).then(res => {
      setBottles(res);
      setLoading(false);
    });
  }, []);
  if (isLoading) return /*#__PURE__*/React.createElement("div", {
    id: "bottle-preloader",
    className: "flex"
  }, /*#__PURE__*/React.createElement("div", {
    id: "bottle-status",
    className: "my-auto"
  }, /*#__PURE__*/React.createElement("i", {
    className: "icon-tea-logo-iconasset-1 grid-gray tea-icon lead mb-0"
  }), /*#__PURE__*/React.createElement("div", {
    id: "bottle-loading-text"
  }, /*#__PURE__*/React.createElement("p", {
    className: "grid-gray"
  }, "steeping..."))));
  if (!bottles) return null;
  const names = [...new Set(bottles.map(b => b.name))];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Showing ", names.length, " packages"), names.map(name => /*#__PURE__*/React.createElement(Bottle, {
    key: name,
    name: name
  })));
  function Bottle({
    name
  }) {
    const [expanded, toggleExpanded] = React.useState(false);
    const versions = [...new Set(bottles.filter(b => b.name === name).map(b => b.version))];
    return /*#__PURE__*/React.createElement("div", {
      className: "expand",
      onClick: () => toggleExpanded(!expanded)
    }, /*#__PURE__*/React.createElement("div", {
      className: "expand-text one-box-down"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "display-3"
    }, name), /*#__PURE__*/React.createElement("h4", {
      className: "display-6"
    }, versions.length, " version", versions.length === 1 ? "" : "s", " bottled")), expanded && /*#__PURE__*/React.createElement("table", {
      className: "one-box-down"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "version"), /*#__PURE__*/React.createElement("th", null, "darwin-aarch64"), /*#__PURE__*/React.createElement("th", null, "darwin-x86-64"), /*#__PURE__*/React.createElement("th", null, "linux-aarch64"), /*#__PURE__*/React.createElement("th", null, "linux-x86-64"))), /*#__PURE__*/React.createElement("tbody", null, versions.map(v => {
      const available = new Set(bottles.filter(b => b.name === name && b.version == v).map(b => `${b.platform}-${b.arch}`));
      return /*#__PURE__*/React.createElement("tr", {
        key: v
      }, /*#__PURE__*/React.createElement("th", null, v), /*#__PURE__*/React.createElement("td", null, available.has("darwin-aarch64") ? "✅" : "❌"), /*#__PURE__*/React.createElement("td", null, available.has("darwin-x86-64") ? "✅" : "❌"), /*#__PURE__*/React.createElement("td", null, available.has("linux-aarch64") ? "✅" : "❌"), /*#__PURE__*/React.createElement("td", null, available.has("linux-x86-64") ? "✅" : "❌"));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "one-box-down"
    }, /*#__PURE__*/React.createElement("hr", null)));
  }
}
ReactDOM.render(React.createElement(Bottles), document.getElementById("app"));