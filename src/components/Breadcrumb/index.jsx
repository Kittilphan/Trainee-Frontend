import { Link } from "react-router-dom";
import Style from "./style.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

export default function Breadcrumb({ items = [] }) {
  if (!Array.isArray(items) || items?.length <= 0) return <></>;
  const Separator = ({ alias }) => {
    return <li>/</li>;
  };
  const ListItems = [];
  items.forEach((item, idx) => {
    if (!Array.isArray(item) && item.length < 2) return <></>;
    const [linkDisplay, linkURL] = item;

    if (linkURL === "/") {
      ListItems.push(
        <li key={idx} className={Style.active}>
          <Link to={`${linkURL}`}>
            <FontAwesomeIcon icon={faHome} fixedWidth />
          </Link>
        </li>
      );
    } else {
      if (idx === items.length - 1) {
        ListItems.push(
          <li key={idx} className={Style.active}>
            <Link to={`${linkURL}`}>{linkDisplay}</Link>
          </li>
        );
      } else {
        ListItems.push(
          <li key={idx}>
            <Link to={`${linkURL}`}>{linkDisplay}</Link>
          </li>
        );
      }
    }
    if (idx >= 0 && items.length > 1 && idx < items.length - 1) {
      ListItems.push(<Separator key={`separator_${idx}`} />);
    }
  });
  return <ul className={Style.wrapper}>{ListItems}</ul>;
}
